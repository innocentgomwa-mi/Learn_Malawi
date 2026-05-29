import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, ClassSerializerInterceptor, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../users/entities/user.entity';
import { ChatMessagesService } from './chat-messages.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat-messages')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Post()
  create(@Body() createChatMessageDto: CreateChatMessageDto) {
    return this.chatMessagesService.create(createChatMessageDto);
  }

  @Get()
  findAll(
    @Req() req: Request & { user?: { email?: string; role?: UserRole } },
    @Query('room') room?: string,
    @Query('notification_feed') notificationFeed?: string,
  ) {
    return this.chatMessagesService.findAll(
      room,
      req.user?.email,
      req.user?.role,
      notificationFeed === 'true',
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatMessageDto: UpdateChatMessageDto) {
    return this.chatMessagesService.update(id, updateChatMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatMessagesService.remove(id);
  }
}
