import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  getInsights(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('limit') limit?: string,
  ) {
    return this.insightsService.getInsights({
      level,
      subject,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
