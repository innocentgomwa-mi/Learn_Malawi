import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ResourceRatingsService } from './resource-ratings.service';
import { CreateResourceRatingDto } from './dto/create-resource-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resource-ratings')
@UseGuards(JwtAuthGuard)
export class ResourceRatingsController {
  constructor(private readonly resourceRatingsService: ResourceRatingsService) {}

  @Post()
  create(@Body() createResourceRatingDto: CreateResourceRatingDto) {
    return this.resourceRatingsService.create(createResourceRatingDto);
  }

  @Get()
  findAll(@Query('resource_id') resourceId?: string) {
    return this.resourceRatingsService.findAll(resourceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceRatingsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceRatingsService.remove(id);
  }
}
