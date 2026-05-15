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
  private defaultModel: string = 'llama-3.3-70b-versatile';

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

  async generateEducationalContent(topic: string, grade?: string) {
    const systemPrompt = grade
      ? `You are an educational assistant for Malawi schools. Generate content appropriate for Grade ${grade} students following the Malawi curriculum.`
      : 'You are an educational assistant for Malawi schools. Generate clear, engaging educational content.';
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain the following topic in a clear and engaging way: ${topic}` },
    ];
    return this.chatCompletion({ messages });
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
    numQuestions: number = 5,
    difficulty?: string,
    embeddingService?: any,
    subject?: string,
    schoolLevel?: string,
  ) {
    const levelDescriptions: Record<string, string> = {
      level1: `BEGINNER level (Level 1):
- Use simple, everyday language a primary school student can understand
- Test basic recall and recognition of facts (e.g. "What is...?", "Name one...")
- Questions should have one clearly obvious correct answer
- Wrong options should be clearly different from the correct answer
- No complex reasoning or multi-step thinking required
- Example style: "What is the capital of Malawi?" or "Which of these is a mammal?"`,

      level2: `INTERMEDIATE level (Level 2) — Requires genuine understanding, not just memory:
- Use clear academic language suitable for secondary school students
- NEVER ask simple recall questions — always require understanding of WHY or HOW
- Questions must require the student to apply a concept to a situation
- Wrong options must be based on common misunderstandings — not obviously wrong
- Include questions that require comparing two concepts, explaining a process, or predicting an outcome
- At least half the questions should start with: "Why...", "How...", "What would happen if...", "Which best explains..."
- Example styles:
  * "Why does a plant placed in the dark eventually stop producing glucose?"
  * "Which of the following best explains why metals conduct electricity?"`,

      level3: `RUTHLESSLY ADVANCED level (Level 3) — This must be genuinely difficult:
- Use highly technical, precise academic language that assumes deep subject mastery
- NEVER test simple recall or basic understanding
- Every question must require analysis, synthesis, or critical evaluation
- Questions must involve multi-step reasoning, connecting 2-3 concepts simultaneously
- Wrong options must be EXTREMELY plausible — a student who partially understands WILL pick them
- Include data interpretation, experimental design, or cause-and-effect chains
- Use negative phrasing: "Which does NOT...", "Which is LEAST accurate..."
- Include scenario/case-study questions where students apply knowledge to unfamiliar situations
- Distractors must contain common misconceptions that students frequently believe are correct
- At least 3 out of every 5 questions must be scenario-based or application-based
- Example styles:
  * "A researcher observes X under condition Y. Which best explains this observation and its implications for Z?"
  * "Under which conditions would the following sequence of events occur, and what would be the most likely outcome?"`,
    };

    const levelMap: Record<string, string> = {
      level1: 'PSLC', level2: 'JCE', level3: 'MSCE',
    };

    // Detect subject type for numerical boost
    const subjectLower = (subject || topic || '').toLowerCase();
    const pureNumerical = ['mathematics', 'maths', 'math', 'statistics', 'accounts', 'accounting'].some(s => subjectLower.includes(s));
    const mixedScience = ['physics', 'chemistry', 'economics'].some(s => subjectLower.includes(s));

    let numericalBoost = '';
    if (pureNumerical) {
      numericalBoost = `

SUBJECT-SPECIFIC INSTRUCTION — PURE MATHEMATICS/NUMERICAL SUBJECT:
- For Level 2: At least 3 out of 5 questions MUST involve real calculations, formula application, or numerical reasoning with actual numbers. Wrong options must be plausible numerical answers based on common errors.
- For Level 3: At least 4 out of 5 questions MUST involve multi-step calculations, data sets, or mathematical proof/reasoning. Wrong options must be results of common calculation mistakes.
- Never ask a purely theoretical question — always express concepts through numbers and equations.
- Always include units where applicable.`;
    } else if (mixedScience) {
      numericalBoost = `

SUBJECT-SPECIFIC INSTRUCTION — MIXED THEORY AND CALCULATION SUBJECT:
- For Level 2: Include a balanced mix — roughly half the questions should involve calculations, the other half advanced theoretical understanding.
- For Level 3: Include a mix of complex multi-step calculations AND deep theoretical/analytical questions.
- Wrong options for numerical questions should be plausible miscalculations. Wrong options for theory questions should be common misconceptions.
- Always include units in numerical questions.`;
    }

    // RAG: search past papers for relevant content
    let contextSection = '';
    if (embeddingService) {
      try {
        // Try with school level + subject first
        let chunks: string[] = await embeddingService.searchRelevantChunks({
          topic,
          subject: subject || topic,
          level: schoolLevel || levelMap[difficulty || ''] || undefined,
          limit: 5,
        });

        // Broader search without level filter
        if (chunks.length === 0) {
          chunks = await embeddingService.searchRelevantChunks({
            topic,
            subject: subject || topic,
            limit: 5,
          });
          if (chunks.length > 0) console.log(`RAG: Broader search found ${chunks.length} chunks`);
        }

        // Widest net — topic only
        if (chunks.length === 0) {
          chunks = await embeddingService.searchRelevantChunks({ topic, limit: 5 });
          if (chunks.length > 0) console.log(`RAG: Topic-only search found ${chunks.length} chunks`);
        }

        if (chunks.length > 0) {
          const chunkText = chunks.map((c: string, i: number) => `[${i + 1}] ${c}`).join('\n\n');
          contextSection = `\n\nRELEVANT PAST PAPER CONTENT (use this to ground your questions in real Malawi exam content):\n${chunkText}`;
          console.log(`RAG: Using ${chunks.length} chunks for "${topic}"`);
        } else {
          console.log(`RAG: No chunks found for "${topic}" — generating from general knowledge`);
        }
      } catch (e) {
        console.error('RAG search failed, falling back to general knowledge:', e.message);
      }
    }

    const levelInstruction = difficulty && levelDescriptions[difficulty]
      ? `\n\nDIFFICULTY INSTRUCTIONS — follow these strictly:\n${levelDescriptions[difficulty]}${numericalBoost}`
      : numericalBoost;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert quiz generator. Generate multiple choice questions in JSON format only. No extra text, no markdown, just a JSON array. Where relevant, draw from the Malawi school curriculum and local context, but keep questions universally understandable — do not force Malawian references into every question.${levelInstruction}${contextSection}`,
      },
      {
        role: 'user',
        content: `Generate ${numQuestions} multiple choice questions about "${topic}" for Malawian students.
${contextSection ? 'Use the provided past paper content to make questions curriculum-accurate.' : ''}

Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct"
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
    const lengthInstruction = maxLength ? ` Keep the summary under ${maxLength} words.` : '';
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful assistant that creates clear, concise summaries of educational content.' },
      { role: 'user', content: `Summarize the following content:${lengthInstruction}\n\n${content}` },
    ];
    return this.chatCompletion({ messages, temperature: 0.5 });
  }

  async checkAnswer(question: string, studentAnswer: string, correctAnswer?: string) {
    const correctAnswerContext = correctAnswer ? `\n\nCorrect answer: ${correctAnswer}` : '';
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a supportive teacher providing constructive feedback on student answers.' },
      { role: 'user', content: `Question: ${question}\n\nStudent answer: ${studentAnswer}${correctAnswerContext}\n\nProvide feedback.` },
    ];
    return this.chatCompletion({ messages, temperature: 0.6 });
  }

  async translateToChichewa(text: string) {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a translator specializing in English to Chichewa (Malawi) translation.' },
      { role: 'user', content: `Translate the following text to Chichewa:\n\n${text}` },
    ];
    return this.chatCompletion({ messages, temperature: 0.3 });
  }
}
