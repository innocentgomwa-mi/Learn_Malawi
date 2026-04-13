import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { DataChangeHistoryService } from './data-change-history.service';
import { CreateDataChangeHistoryDto } from './dto/create-data-change-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('data-change-history')
@UseGuards(JwtAuthGuard)
export class DataChangeHistoryController {
  constructor(private readonly dataChangeHistoryService: DataChangeHistoryService) {}

  @Post()
  create(@Body() createDataChangeHistoryDto: CreateDataChangeHistoryDto) {
    return this.dataChangeHistoryService.create(createDataChangeHistoryDto);
  }

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.dataChangeHistoryService.findAll(limit ? Number(limit) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataChangeHistoryService.findOne(id);
  }
}
