import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIRequestDto } from './dto/ai-request.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('ai')
@UsePipes(new ValidationPipe({ transform: true }))
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Public()
  @Post('ask')
  async ask(@Body() dto: AIRequestDto) {
    return this.aiService.ask(dto);
  }
}
