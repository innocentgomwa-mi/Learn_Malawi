import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Attendance } from './entities/attendance.entity';

@Controller('attendance')
@UseInterceptors(ClassSerializerInterceptor)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findAll(
    @Req() req: Request & { user?: { email?: string } },
    @Query('teacher_email') teacherEmail?: string,
    @Query('course') course?: string,
    @Query('date') date?: string,
  ): Promise<Attendance[]> {
    const effectiveTeacherEmail = teacherEmail || req.user?.email;
    return this.attendanceService.findAll(effectiveTeacherEmail, course, date);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findOne(@Param('id') id: string): Promise<Attendance> {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.attendanceService.remove(id);
  }
}
