import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  create(createActivityLogDto: CreateActivityLogDto) {
    const entry = this.activityLogRepository.create(createActivityLogDto);
    return this.activityLogRepository.save(entry);
  }

  findAll(limit?: number, action?: string) {
    const query = this.activityLogRepository.createQueryBuilder('activity_log')
      .orderBy('activity_log.created_date', 'DESC');

    if (limit) {
      query.take(limit);
    }
    if (action) {
      query.andWhere('activity_log.action = :action', { action });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const entry = await this.activityLogRepository.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Activity log entry not found');
    }
    return entry;
  }
}
