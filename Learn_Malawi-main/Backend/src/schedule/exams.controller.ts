import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@User() user: any, @Body() createExamDto: CreateExamDto) {
    return this.scheduleService.createExam(createExamDto, user?.email);
  }

  @Get()
  findAll(@User() user: any) {
    return this.scheduleService.findAllExams(user?.email);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) {
    return this.scheduleService.findExam(id, user?.email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @User() user: any, @Body() updateExamDto: UpdateExamDto) {
    return this.scheduleService.updateExam(id, updateExamDto, user?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.scheduleService.removeExam(id, user?.email);
  }
}
