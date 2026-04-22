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
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    this.groq = new Groq({ apiKey });
  }

  async chatCompletion(request: ChatCompletionRequest) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: request.messages,
        model: request.model || this.defaultModel,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 1024,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        model: completion.model,
        usage: completion.usage,
        finishReason: completion.choices[0]?.finish_reason,
      };
    } catch (error) {
      throw new HttpException(
        `Groq API Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateEducationalContent(topic: string, grade?: string) {
    const systemPrompt = grade
      ? `You are an educational assistant for Malawi schools. Generate content appropriate for Grade ${grade} students following the Malawi curriculum.`
      : 'You are an educational assistant for Malawi schools. Generate clear, engaging educational content.';

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Explain the following topic in a clear and engaging way: ${topic}` 
      },
    ];

    return this.chatCompletion({ messages });
  }

  async answerQuestion(question: string, context?: string) {
    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are a helpful teacher assistant in Malawi. Provide clear, accurate answers to student questions.' 
      },
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Context: ${context}`,
      });
    }

    messages.push({ role: 'user', content: question });

    return this.chatCompletion({ messages });
  }

  async generateQuiz(topic: string, numQuestions: number = 5, difficulty?: string) {
    const difficultyText = difficulty ? ` at ${difficulty} difficulty level` : '';
    
    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are an expert quiz generator for educational content. Generate multiple choice questions in JSON format.' 
      },
      { 
        role: 'user', 
        content: `Generate ${numQuestions} multiple choice questions about "${topic}"${difficultyText}. 
        
Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct"
  }
]`
      },
    ];

    const response = await this.chatCompletion({ messages, temperature: 0.8 });
    
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response.content);
    } catch (error) {
      throw new HttpException(
        'Failed to parse quiz questions from AI response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async summarizeContent(content: string, maxLength?: number) {
    const lengthInstruction = maxLength 
      ? ` Keep the summary under ${maxLength} words.` 
      : '';

    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are a helpful assistant that creates clear, concise summaries of educational content.' 
      },
      { 
        role: 'user', 
        content: `Summarize the following content:${lengthInstruction}\n\n${content}` 
      },
    ];

    return this.chatCompletion({ messages, temperature: 0.5 });
  }

  async checkAnswer(question: string, studentAnswer: string, correctAnswer?: string) {
    const correctAnswerContext = correctAnswer 
      ? `\n\nCorrect answer: ${correctAnswer}` 
      : '';

    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are a supportive teacher providing constructive feedback on student answers. Be encouraging but accurate.' 
      },
      { 
        role: 'user', 
        content: `Question: ${question}\n\nStudent's answer: ${studentAnswer}${correctAnswerContext}\n\nProvide feedback on this answer.` 
      },
    ];

    return this.chatCompletion({ messages, temperature: 0.6 });
  }

  async translateToChichewa(text: string) {
    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are a translator specializing in English to Chichewa (Malawi) translation.' 
      },
      { 
        role: 'user', 
        content: `Translate the following text to Chichewa:\n\n${text}` 
      },
    ];

    return this.chatCompletion({ messages, temperature: 0.3 });
  }
}
