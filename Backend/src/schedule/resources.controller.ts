import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@User() user: any, @Body() createResourceDto: CreateResourceDto) {
    return this.scheduleService.createResource(createResourceDto, user?.email);
  }

  @Get()
  findAll(@User() user: any) {
    return this.scheduleService.findAllResources(user?.email);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) {
    return this.scheduleService.findResource(id, user?.email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @User() user: any, @Body() updateResourceDto: UpdateResourceDto) {
    return this.scheduleService.updateResource(id, updateResourceDto, user?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.scheduleService.removeResource(id, user?.email);
  }
}
