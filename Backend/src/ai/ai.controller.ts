import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { AiService } from './ai.service';
import { CreateAiRequestDto } from './dto/create-ai-request.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('chat')
  async chat(@Body() createAiRequestDto: CreateAiRequestDto) {
    const text = await this.aiService.generateResponse(createAiRequestDto.prompt);
    return { text };
  }
}
