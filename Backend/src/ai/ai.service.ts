import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { AIRequestDto, AIFeature } from './dto/ai-request.dto';

@Injectable()
export class AIService {
  private groq: Groq;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  private getSystemPrompt(feature: AIFeature, context?: string): string {
    const base = `You are an AI assistant for Learn Malawi, an educational platform 
    for Malawian students from Standard 5 to Form 4. Keep answers clear, simple, 
    and encouraging. Use examples relevant to Malawi where possible.`;

    const prompts = {
      [AIFeature.TUTOR]: `${base} You are a friendly study tutor. 
        Explain concepts clearly for the student's level. 
        ${context ? `Subject context: ${context}` : ''}`,

      [AIFeature.QUIZ_EXPLAIN]: `${base} You are explaining a quiz answer. 
        Be clear about why the correct answer is right and why wrong answers 
        are incorrect. Keep it educational and encouraging.
        ${context ? `Quiz context: ${context}` : ''}`,

      [AIFeature.SUMMARISE]: `${base} You are summarising study material. 
        Create clear bullet point summaries that students can use to revise. 
        Focus on key concepts and important facts.
        ${context ? `Material context: ${context}` : ''}`,

      [AIFeature.CAREER_ADVICE]: `${base} You are a career advisor for Malawian 
        students. Suggest realistic careers available in Malawi. Consider the 
        local job market, universities like UNIMA, Mzuzu University, and 
        opportunities in the region.
        ${context ? `Student context: ${context}` : ''}`,

      [AIFeature.PAST_PAPER]: `${base} You are helping a student understand 
        an exam question. Guide them on how to approach and structure their 
        answer without giving it away completely. Help them think through it.
        ${context ? `Exam context: ${context}` : ''}`,
    };

    return prompts[feature];
  }

  async ask(dto: AIRequestDto): Promise<{ reply: string }> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(dto.feature, dto.context),
          },
          {
            role: 'user',
            content: dto.message,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || 
        'Sorry, I could not generate a response. Please try again.';

      return { reply };
    } catch (error) {
      console.error('Groq API error:', error);
      throw new InternalServerErrorException(
        'AI service is currently unavailable. Please try again later.'
      );
    }
  }
}
