import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { StudyGroupsService } from './study-groups.service';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { UpdateStudyGroupDto } from './dto/update-study-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('study-groups')
@UseGuards(JwtAuthGuard)
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Post()
  create(@Body() createStudyGroupDto: CreateStudyGroupDto) {
    return this.studyGroupsService.create(createStudyGroupDto);
  }

  @Get()
  findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('mentor_email') mentorEmail?: string,
  ) {
    return this.studyGroupsService.findAll(level, subject, mentorEmail);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studyGroupsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudyGroupDto: UpdateStudyGroupDto) {
    return this.studyGroupsService.update(id, updateStudyGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studyGroupsService.remove(id);
  }
}
