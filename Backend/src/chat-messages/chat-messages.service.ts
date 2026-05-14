import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
  ) {}

  async create(createChatMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    const message = this.chatMessageRepository.create({
      ...createChatMessageDto,
      room: createChatMessageDto.room || 'general',
    });
    return this.chatMessageRepository.save(message);
  }

  async findAll(room?: string): Promise<ChatMessage[]> {
    const where = room ? { room } : {};
    return this.chatMessageRepository.find({
      where,
      order: { created_date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ChatMessage> {
    const message = await this.chatMessageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Chat message with ID ${id} not found`);
    }
    return message;
  }

  async update(id: string, updateChatMessageDto: UpdateChatMessageDto): Promise<ChatMessage> {
    const message = await this.findOne(id);
    Object.assign(message, updateChatMessageDto);
    return this.chatMessageRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.chatMessageRepository.remove(message);
  }
}
