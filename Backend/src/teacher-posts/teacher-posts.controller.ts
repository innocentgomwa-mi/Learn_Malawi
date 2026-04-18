import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TeacherPostsService } from './teacher-posts.service';
import { CreateTeacherPostDto } from './dto/create-teacher-post.dto';
import { UpdateTeacherPostDto } from './dto/update-teacher-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('teacher-posts')
@UseGuards(JwtAuthGuard)
export class TeacherPostsController {
  constructor(private readonly teacherPostsService: TeacherPostsService) {}

  @Post()
  create(@Body() createTeacherPostDto: CreateTeacherPostDto) {
    return this.teacherPostsService.create(createTeacherPostDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.teacherPostsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherPostsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherPostDto: UpdateTeacherPostDto) {
    return this.teacherPostsService.update(id, updateTeacherPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherPostsService.remove(id);
  }
}
