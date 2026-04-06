import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementsService.create(createAnnouncementDto);
  }

  @Get()
  findAll(@Query('teacher_email') teacherEmail?: string) {
    return this.announcementsService.findAll(teacherEmail);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
