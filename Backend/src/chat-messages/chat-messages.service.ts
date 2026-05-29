import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { EmailService } from '../auth/email.service';
import { isChatMessageVisibleAsNotification } from '../common/notification-audience';

@Injectable()
export class ChatMessagesService {
  private readonly logger = new Logger(ChatMessagesService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    private readonly emailService: EmailService,
  ) {}

  async create(createChatMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    const message = this.chatMessageRepository.create({
      ...createChatMessageDto,
      room: createChatMessageDto.room || 'general',
    });
    const savedMessage = await this.chatMessageRepository.save(message);
    await this.createMentionNotifications(savedMessage);
    return savedMessage;
  }

  private async createMentionNotifications(message: ChatMessage) {
    const mentionPattern = /@([^\s]+)/g;
    const mentions = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = mentionPattern.exec(message.message))) {
      let token = match[1].trim();
      token = token.replace(/[.,!?;:]+$/, '');
      if (token) mentions.add(token);
    }

    if (mentions.size === 0) {
      return;
    }

    const teachers = await this.userRepository.find({
      where: { role: UserRole.TEACHER },
      select: ['id', 'firstName', 'lastName', 'email'],
    });

    const notifiedTeacherEmails = new Set<string>();
    const snippet = message.message.length > 120 ? `${message.message.slice(0, 120)}...` : message.message;

    for (const token of mentions) {
      const normalizedToken = token.trim().toLowerCase();
      const resolved = teachers.find((teacher) => {
        const teacherEmailLower = teacher.email.toLowerCase();
        const teacherFullName = [teacher.firstName, teacher.lastName].filter(Boolean).join(' ').toLowerCase();
        const normalizedName = normalizedToken.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

        return teacherEmailLower === normalizedToken || teacherFullName === normalizedName;
      });

      if (!resolved || resolved.email === message.sender_email || notifiedTeacherEmails.has(resolved.email)) {
        continue;
      }

      notifiedTeacherEmails.add(resolved.email);
      const announcement = this.announcementRepository.create({
        title: `${message.sender_name} mentioned you in teacher chat`,
        body: `${message.sender_name} mentioned you in the teacher chat: "${snippet}"`,
        targetAudience: 'teachers',
        priority: 'normal',
        isPublished: true,
        teacherEmail: resolved.email,
        link: '/teacher/collaboration',
      });

      await this.announcementRepository.save(announcement);
      await this.notifyTeacherMentionByEmail(resolved.email, message.sender_name, snippet, announcement.link);
    }
  }

  private async notifyTeacherMentionByEmail(
    email: string,
    senderName: string,
    snippet: string,
    link?: string,
  ) {
    const subject = `${senderName} mentioned you in teacher chat`;
    const body = `Hello,

${senderName} mentioned you in teacher chat.

"${snippet}"

${link ? `Visit: ${link}` : 'Open the app to view the chat.'}`;

    try {
      await this.emailService.sendEmail(email, subject, body);
    } catch (error) {
      this.logger.warn(
        `Unable to deliver mention email to ${email}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  async findAll(
    room?: string,
    viewerEmail?: string,
    viewerRole?: string,
    notificationFeed = false,
  ): Promise<ChatMessage[]> {
    const where = room ? { room } : {};
    const messages = await this.chatMessageRepository.find({
      where,
      order: { created_date: 'ASC' },
    });

    if (!notificationFeed || !viewerEmail) {
      return messages;
    }

    const teachers = await this.userRepository.find({
      where: { role: UserRole.TEACHER },
      select: ['email'],
    });
    const teacherEmails = new Set(teachers.map((teacher) => teacher.email.toLowerCase()));

    return messages.filter((message) =>
      isChatMessageVisibleAsNotification(
        message.sender_email,
        viewerEmail,
        viewerRole,
        teacherEmails,
      ),
    );
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
