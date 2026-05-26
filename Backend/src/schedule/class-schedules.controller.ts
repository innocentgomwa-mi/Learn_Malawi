import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('class-schedules')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class ClassSchedulesController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@User() user: any, @Body() createClassScheduleDto: CreateClassScheduleDto) {
    return this.scheduleService.createClassSchedule(createClassScheduleDto, user?.email);
  }

  @Get()
  findAll(@User() user: any) {
    return this.scheduleService.findAllClassSchedules(user?.email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @User() user: any, @Body() updateClassScheduleDto: UpdateClassScheduleDto) {
    return this.scheduleService.updateClassSchedule(id, updateClassScheduleDto, user?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.scheduleService.removeClassSchedule(id, user?.email);
  }
}
