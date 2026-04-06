import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('discussions')
@UseGuards(JwtAuthGuard)
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post()
  create(@Body() createDiscussionDto: CreateDiscussionDto) {
    return this.discussionsService.create(createDiscussionDto);
  }

  @Get()
  findAll(@Query('teacher_email') teacherEmail?: string) {
    return this.discussionsService.findAll(teacherEmail);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discussionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiscussionDto: UpdateDiscussionDto) {
    return this.discussionsService.update(id, updateDiscussionDto);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() addCommentDto: AddCommentDto) {
    return this.discussionsService.addComment(id, addCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discussionsService.remove(id);
  }
}
