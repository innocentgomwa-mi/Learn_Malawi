import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessagesController } from './chat-messages.controller';
import { ChatMessage } from './chat-message.entity';
import { User } from '../users/entities/user.entity';
import { Announcement } from '../announcements/entities/announcement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, User, Announcement])],
  controllers: [ChatMessagesController],
  providers: [ChatMessagesService],
  exports: [ChatMessagesService],
})
export class ChatMessagesModule {}
