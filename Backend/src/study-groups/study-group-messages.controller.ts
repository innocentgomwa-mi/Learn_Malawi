import { BadRequestException, Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { StudyGroupsService } from './study-groups.service';
import { CreateStudyGroupMessageDto } from './dto/create-study-group-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('study-group-messages')
@UseGuards(JwtAuthGuard)
export class StudyGroupMessagesController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Get()
  findAll(@Query('group_id') groupId?: string) {
    if (!groupId) {
      throw new BadRequestException('group_id query parameter is required');
    }
    return this.studyGroupsService.findMessages(groupId);
  }

  @Post()
  create(@Body() createStudyGroupMessageDto: CreateStudyGroupMessageDto) {
    return this.studyGroupsService.createMessage(createStudyGroupMessageDto);
  }
}
