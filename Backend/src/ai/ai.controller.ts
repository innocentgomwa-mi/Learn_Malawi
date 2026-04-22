import { Controller, Post, Body, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { AiService } from './ai.service';
import {
  AskQuestionDto,
  QuizDto,
  EducationalContentDto,
  SummarizeDto,
  CheckAnswerDto,
  TranslateDto,
  ChatCompletionDto,
} from './dto/create-ai-request.dto';

@Controller('ai')
@Public()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('models')
  getAvailableModels() {
    return {
      models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Recommended)', description: 'Best for general use' },
        { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: 'Fast and versatile' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Fastest, good for simple tasks' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Great for long contexts' },
      ],
    };
  }

  @Post('chat')
  async chat(@Body() dto: ChatCompletionDto) {
    return this.aiService.chatCompletion(dto);
  }

  @Post('generate-content')
  async generateContent(@Body() dto: EducationalContentDto) {
    return this.aiService.generateEducationalContent(dto.topic, dto.grade);
  }

  @Post('ask')
  async askQuestion(@Body() dto: AskQuestionDto) {
    return this.aiService.answerQuestion(dto.question, dto.context);
  }

  @Post('generate-quiz')
  async generateQuiz(@Body() dto: QuizDto) {
    return this.aiService.generateQuiz(dto.topic, dto.numQuestions || 5, dto.difficulty);
  }

  @Post('summarize')
  async summarize(@Body() dto: SummarizeDto) {
    return this.aiService.summarizeContent(dto.content, dto.maxLength);
  }

  @Post('check-answer')
  async checkAnswer(@Body() dto: CheckAnswerDto) {
    return this.aiService.checkAnswer(dto.question, dto.studentAnswer, dto.correctAnswer);
  }

  @Post('translate')
  async translate(@Body() dto: TranslateDto) {
    return this.aiService.translateToChichewa(dto.text);
  }
}
