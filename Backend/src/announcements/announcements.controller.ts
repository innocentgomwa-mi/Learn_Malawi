import { BadRequestException, Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  create(
    @Req() req: Request & { user?: { email?: string } },
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    const teacherEmail = createAnnouncementDto.teacherEmail || req.user?.email;
    if (!teacherEmail) {
      throw new BadRequestException('teacherEmail is required');
    }

    return this.announcementsService.create({
      ...createAnnouncementDto,
      teacherEmail,
    });
  }

  @Get()
  findAll(
    @Query('teacher_email') teacherEmail?: string,
    @Query('published') published?: string,
  ) {
    const publishedFlag = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.announcementsService.findAll(teacherEmail, publishedFlag);
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
