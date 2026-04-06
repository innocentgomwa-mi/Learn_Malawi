import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    const announcement = this.announcementsRepository.create(createAnnouncementDto);
    return this.announcementsRepository.save(announcement);
  }

  async findAll(teacherEmail?: string) {
    const where = teacherEmail ? { teacherEmail } : {};
    return this.announcementsRepository.find({ where, order: { createdAt: 'DESC' } });
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
