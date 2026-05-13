import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLog } from './entities/activity-log.entity';
import { SearchLogService } from '../search-log/search-log.service';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly searchLogService: SearchLogService,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto) {
    const entry = this.activityLogRepository.create(createActivityLogDto);
    const saved = await this.activityLogRepository.save(entry);

    if (createActivityLogDto.action === 'resource_searched') {
      try {
        const metadata = createActivityLogDto.metadata
          ? JSON.parse(createActivityLogDto.metadata)
          : {};

        const query = metadata?.query || createActivityLogDto.subject || '';
        if (query) {
          const normalizedRole = ['student', 'teacher', 'admin'].includes(createActivityLogDto.user_role || '')
            ? createActivityLogDto.user_role
            : undefined;

          await this.searchLogService.create({
            query,
            user_email: createActivityLogDto.user_email,
            user_name: createActivityLogDto.user_name,
            user_role: normalizedRole as 'student' | 'teacher' | 'admin' | undefined,
            results_count: typeof metadata?.results_count === 'number' ? metadata.results_count : undefined,
            subject_filter: metadata?.subjectFilter || createActivityLogDto.subject,
            level_filter: createActivityLogDto.level,
          });
        }
      } catch (error) {
        // keep activity logging stable even if search log creation fails
        console.warn('Unable to create SearchLog from activity log:', error?.message || error);
      }
    }

    return saved;
  }

  findAll(limit?: number, action?: string, level?: string, subject?: string) {
    const query = this.activityLogRepository.createQueryBuilder('activity_log')
      .orderBy('activity_log.created_date', 'DESC');

    if (limit) {
      query.take(limit);
    }
    if (action) {
      query.andWhere('activity_log.action = :action', { action });
    }
    if (level) {
      query.andWhere('activity_log.level = :level', { level });
    }
    if (subject) {
      query.andWhere('activity_log.subject = :subject', { subject });
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
