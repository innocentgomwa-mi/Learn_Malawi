import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activity-log')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogService.create(createActivityLogDto);
  }

  @Get()
  findAll(@Query('limit') limit?: string, @Query('action') action?: string) {
    return this.activityLogService.findAll(limit ? Number(limit) : undefined, action);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityLogService.findOne(id);
  }
}
