import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateStudyBlockDto } from './dto/create-study-block.dto';
import { UpdateStudyBlockDto } from './dto/update-study-block.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('study-blocks')
@UseGuards(JwtAuthGuard)
export class StudyBlocksController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@User() user: any, @Body() createStudyBlockDto: CreateStudyBlockDto) {
    return this.scheduleService.createStudyBlock(createStudyBlockDto, user?.email);
  }

  @Get()
  findAll(@User() user: any) {
    return this.scheduleService.findAllStudyBlocks(user?.email);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) {
    return this.scheduleService.findStudyBlock(id, user?.email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @User() user: any, @Body() updateStudyBlockDto: UpdateStudyBlockDto) {
    return this.scheduleService.updateStudyBlock(id, updateStudyBlockDto, user?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.scheduleService.removeStudyBlock(id, user?.email);
  }
}
