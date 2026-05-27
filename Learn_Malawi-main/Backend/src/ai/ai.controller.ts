import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { CreateAiRequestDto } from './dto/create-ai-request.dto';
import { CreateAiQuizDto } from './dto/create-ai-quiz.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  @Public()
  @Post('chat')
  async chat(@Body() createAiRequestDto: CreateAiRequestDto) {
    try {
      const text = await this.aiService.generateResponse(createAiRequestDto.prompt);
      return { text };
    } catch (error) {
      console.error('AI chat failed:', error);
      return { text: 'Sorry, the AI tutor is unavailable right now. Please try again later.' };
    }
  }

  @Public()
  @Post('quiz')
  async generateQuiz(@Body() createAiQuizDto: CreateAiQuizDto) {
    const topic = createAiQuizDto.topic || createAiQuizDto.title;
    const questions = await this.aiService.generateQuiz(
      topic,
      10,
      createAiQuizDto.level || 'level1',
      this.embeddingService,
      createAiQuizDto.subject || topic,
      createAiQuizDto.schoolLevel,
    );
    return { questions };
  }
}
