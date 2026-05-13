import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SearchLogService } from './search-log.service';
import { CreateSearchLogDto } from './dto/create-search-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search-logs')
@UseGuards(JwtAuthGuard)
export class SearchLogController {
  constructor(private readonly searchLogService: SearchLogService) {}

  @Post()
  create(@Body() createSearchLogDto: CreateSearchLogDto) {
    return this.searchLogService.create(createSearchLogDto);
  }

  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('query') query?: string,
    @Query('user_email') user_email?: string,
    @Query('subject_filter') subject_filter?: string,
    @Query('level_filter') level_filter?: string,
  ) {
    return this.searchLogService.findAll(
      limit ? Number(limit) : undefined,
      query,
      user_email,
      subject_filter,
      level_filter,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchLogService.findOne(id);
  }
}
