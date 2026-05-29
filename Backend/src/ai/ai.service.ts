import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

@Injectable()
export class AiService {
  private groq: Groq;
  private defaultModel = 'llama-3.3-70b-versatile';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) throw new Error('GROQ_API_KEY not found in environment variables');
    this.groq = new Groq({ apiKey });
  }

  async chatCompletion(request: ChatCompletionRequest) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: request.messages,
        model: request.model || this.defaultModel,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 4096,
      });
      return {
        content: completion.choices[0]?.message?.content || '',
        model: completion.model,
        usage: completion.usage,
        finishReason: completion.choices[0]?.finish_reason,
      };
    } catch (error) {
      throw new HttpException(`Groq API Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful teacher assistant in Malawi. Provide clear, accurate answers.' },
        { role: 'user', content: prompt },
      ],
    });
    return response.content;
  }

  async answerQuestion(question: string, context?: string) {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful teacher assistant in Malawi. Provide clear, accurate answers to student questions.' },
    ];
    if (context) messages.push({ role: 'system', content: `Context: ${context}` });
    messages.push({ role: 'user', content: question });
    return this.chatCompletion({ messages });
  }

  async generateQuiz(
    topic: string,
    numQuestions: number = 10,
    difficulty?: string,
    embeddingService?: any,
    subject?: string,
    schoolLevel?: string,
  ) {
    const levelDescriptions: Record<string, string> = {
      level1: `BEGINNER level (Level 1):
- Use simple, everyday language a primary school student can understand
- Test basic recall and recognition of facts (e.g. "What is...?", "Name one...")
- One clearly obvious correct answer; wrong options clearly different
- No complex reasoning required`,

      level2: `INTERMEDIATE level (Level 2) — Requires genuine understanding:
- NEVER ask simple recall — always require understanding of WHY or HOW
- Questions must require applying a concept, not just remembering it
- Wrong options based on common misunderstandings
- At least half should start: "Why...", "How...", "What would happen if...", "Which best explains..."`,

      level3: `RUTHLESSLY ADVANCED level (Level 3):
- Assumes deep subject mastery — NEVER test simple recall
- Every question requires analysis, synthesis, or critical evaluation
- Multi-step reasoning connecting 2-3 concepts simultaneously
- Wrong options EXTREMELY plausible — partial understanding will lead to wrong answer
- Use: "Which does NOT...", "Which is LEAST accurate...", scenario/case-study questions
- Distractors must contain common misconceptions students frequently believe are correct
- At least 3 of 5 questions must be scenario-based or application-based`,
    };

    const levelMap: Record<string, string> = { level1: 'PSLC', level2: 'JCE', level3: 'MSCE' };

    const subjectLower = (subject || topic || '').toLowerCase();
    const pureNumerical = ['mathematics', 'maths', 'math', 'statistics', 'accounts', 'accounting'].some(s => subjectLower.includes(s));
    const mixedScience = ['physics', 'chemistry', 'economics'].some(s => subjectLower.includes(s));

    let numericalBoost = '';
    if (pureNumerical) {
      numericalBoost = `\n\nSUBJECT INSTRUCTION — PURE NUMERICAL SUBJECT:
- Level 2: At least 3/5 questions MUST involve real calculations with actual numbers
- Level 3: At least 4/5 questions MUST involve multi-step calculations or mathematical proof
- Never ask purely theoretical questions — express through numbers and equations
- Always include units where applicable`;
    } else if (mixedScience) {
      numericalBoost = `\n\nSUBJECT INSTRUCTION — MIXED THEORY AND CALCULATION:
- Level 2: Balanced mix — half calculations, half advanced theoretical understanding
- Level 3: Mix of complex multi-step calculations AND deep theoretical/analytical questions
- Always include units in numerical questions`;
    }

    // RAG: search past papers for relevant content
    let contextSection = '';
    if (embeddingService) {
      try {
        let chunks: string[] = await embeddingService.searchRelevantChunks({
          topic, subject: subject || topic,
          level: schoolLevel || levelMap[difficulty || ''] || undefined,
          limit: 5,
        });
        if (chunks.length === 0) {
          chunks = await embeddingService.searchRelevantChunks({ topic, subject: subject || topic, limit: 5 });
          if (chunks.length > 0) console.log(`RAG: Broader search found ${chunks.length} chunks`);
        }
        if (chunks.length === 0) {
          chunks = await embeddingService.searchRelevantChunks({ topic, limit: 5 });
          if (chunks.length > 0) console.log(`RAG: Topic-only search found ${chunks.length} chunks`);
        }
        if (chunks.length > 0) {
          const chunkText = chunks.map((c, i) => `[${i + 1}] ${c}`).join('\n\n');
          contextSection = `\n\nRELEVANT PAST PAPER CONTENT (ground your questions in this real Malawi exam content):\n${chunkText}`;
          console.log(`RAG: Using ${chunks.length} chunks for "${topic}"`);
        } else {
          console.log(`RAG: No chunks found for "${topic}" — using general knowledge`);
        }
      } catch (e) {
        console.error('RAG search failed:', e.message);
      }
    }

    const levelInstruction = difficulty && levelDescriptions[difficulty]
      ? `\n\nDIFFICULTY INSTRUCTIONS — follow strictly:\n${levelDescriptions[difficulty]}${numericalBoost}`
      : numericalBoost;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert quiz generator. Generate multiple choice questions in JSON format only. No extra text, no markdown, just a JSON array. Where relevant draw from Malawi school curriculum but keep questions universally understandable.${levelInstruction}${contextSection}`,
      },
      {
        role: 'user',
        content: `Generate ${numQuestions} multiple choice questions about "${topic}" for students.
${contextSection ? 'Use the provided past paper content to make questions curriculum-accurate.' : ''}

Return ONLY a JSON array:
[
  {
    "question": "Question text?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A",
    "explanation": "Brief explanation"
  }
]`,
      },
    ];

    const response = await this.chatCompletion({ messages, temperature: 0.8 });

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(response.content);
    } catch {
      throw new HttpException('Failed to parse quiz questions from AI response', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async summarizeContent(content: string, maxLength?: number) {
    const lengthInstruction = maxLength ? ` Keep under ${maxLength} words.` : '';
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful assistant that creates clear, concise summaries of educational content.' },
      { role: 'user', content: `Summarize the following:${lengthInstruction}\n\n${content}` },
    ];
    return this.chatCompletion({ messages, temperature: 0.5 });
  }

  async generateEducationalContent(topic: string, grade?: string) {
    const systemPrompt = grade
      ? `You are an educational assistant for Malawi schools. Generate content for Grade ${grade} students.`
      : 'You are an educational assistant for Malawi schools.';
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain: ${topic}` },
    ];
    return this.chatCompletion({ messages });
  }

  async translateToChichewa(text: string) {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a translator specializing in English to Chichewa (Malawi) translation.' },
      { role: 'user', content: `Translate to Chichewa:\n\n${text}` },
    ];
    return this.chatCompletion({ messages, temperature: 0.3 });
  }
}
