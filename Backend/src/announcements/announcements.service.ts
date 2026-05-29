import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../auth/email.service';
import { isAnnouncementVisibleToRole } from '../common/notification-audience';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    const announcement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      targetAudience: createAnnouncementDto.targetAudience ?? 'all',
      priority: createAnnouncementDto.priority ?? 'normal',
      isPublished: createAnnouncementDto.isPublished ?? false,
    });

    const savedAnnouncement = await this.announcementsRepository.save(announcement);

    if (savedAnnouncement.isPublished) {
      await this.notifyAudienceByEmail(savedAnnouncement);
    }

    return savedAnnouncement;
  }

  private async notifyAudienceByEmail(announcement: Announcement) {
    const audience = announcement.targetAudience || 'all';
    const where: Record<string, any> = {};

    if (audience === 'teachers') {
      where.role = UserRole.TEACHER;
    } else if (audience === 'students') {
      where.role = UserRole.STUDENT;
    } else if (audience === 'admins') {
      where.role = UserRole.ADMIN;
    } else {
      where.role = In([UserRole.TEACHER, UserRole.STUDENT, UserRole.ADMIN]);
    }

    const recipients = await this.userRepository.find({
      where,
      select: ['email'],
    });

    if (!recipients.length) {
      return;
    }

    const subject = `New announcement: ${announcement.title}`;
    const body = `${announcement.body}

${announcement.link ? `Open this link: ${announcement.link}` : 'Open the app to view this announcement.'}`;

    await Promise.all(
      recipients.map(async (recipient) => {
        try {
          await this.emailService.sendEmail(recipient.email, subject, body);
        } catch (error) {
          this.logger.warn(
            `Unable to deliver announcement email to ${recipient.email}: ${error instanceof Error ? error.message : 'unknown error'}`,
          );
        }
      }),
    );
  }

  async findAll(teacherEmail?: string, published?: boolean) {
    const where: Record<string, any> = {};
    if (teacherEmail) where.teacherEmail = teacherEmail;
    if (published !== undefined) where.isPublished = published;
    return this.announcementsRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findAllForViewer(options: {
    teacherEmail?: string;
    published?: boolean;
    viewerEmail?: string;
    viewerRole?: string;
  }) {
    const announcements = await this.findAll(options.teacherEmail, options.published);

    if (options.teacherEmail) {
      return announcements;
    }

    return announcements.filter((announcement) =>
      isAnnouncementVisibleToRole(
        announcement.targetAudience,
        options.viewerRole,
        options.viewerEmail,
        announcement.teacherEmail,
      ),
    );
  }

  async findOne(id: string) {
    const announcement = await this.announcementsRepository.findOne({ where: { id } });
    if (!announcement) {
      throw new NotFoundException(`Announcement ${id} not found`);
    }
    return announcement;
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    const announcement = await this.findOne(id);
    Object.assign(announcement, updateAnnouncementDto);
    return this.announcementsRepository.save(announcement);
  }

  async remove(id: string) {
    const announcement = await this.findOne(id);
    return this.announcementsRepository.remove(announcement);
  }
}
