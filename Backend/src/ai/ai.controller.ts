import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { AiService } from './ai.service';
import { CreateAiRequestDto } from './dto/create-ai-request.dto';
import { CreateAiQuizDto } from './dto/create-ai-quiz.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('chat')
  async chat(@Body() createAiRequestDto: CreateAiRequestDto) {
    try {
      const text = await this.aiService.generateResponse(createAiRequestDto.prompt);
      return { text };
    } catch (error) {
      console.error('AI chat failed:', error);
      return {
        text: 'Sorry, the AI tutor is unavailable right now. Please try again later.',
      };
    }
  }

  @Public()
  @Post('quiz')
  async generateQuiz(@Body() createAiQuizDto: CreateAiQuizDto) {
    const questions = await this.aiService.generateQuiz(createAiQuizDto);
    return { questions };
  }
}
