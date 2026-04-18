import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { StudentProgressService } from './student-progress.service';
import { CreateStudentProgressDto } from './dto/create-student-progress.dto';
import { UpdateStudentProgressDto } from './dto/update-student-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('student-progress')
@UseGuards(JwtAuthGuard)
export class StudentProgressController {
  constructor(private readonly studentProgressService: StudentProgressService) {}

  @Post()
  create(@Body() createStudentProgressDto: CreateStudentProgressDto) {
    return this.studentProgressService.create(createStudentProgressDto);
  }

  @Get()
  findAll(@Query('student_email') studentEmail?: string) {
    return this.studentProgressService.findAll(studentEmail);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentProgressService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentProgressDto: UpdateStudentProgressDto) {
    return this.studentProgressService.update(id, updateStudentProgressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentProgressService.remove(id);
  }
}
