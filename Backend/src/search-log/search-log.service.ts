import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSearchLogDto } from './dto/create-search-log.dto';
import { SearchLog } from './entities/search-log.entity';

@Injectable()
export class SearchLogService {
  constructor(
    @InjectRepository(SearchLog)
    private readonly searchLogRepository: Repository<SearchLog>,
  ) {}

  create(createSearchLogDto: CreateSearchLogDto) {
    const entry = this.searchLogRepository.create(createSearchLogDto);
    return this.searchLogRepository.save(entry);
  }

  findAll(
    limit?: number,
    query?: string,
    user_email?: string,
    subject_filter?: string,
    level_filter?: string,
  ) {
    const qb = this.searchLogRepository.createQueryBuilder('search_log')
      .orderBy('search_log.created_date', 'DESC');

    if (limit) {
      qb.take(limit);
    }
    if (query) {
      qb.andWhere('LOWER(search_log.query) LIKE :query', { query: `%${query.toLowerCase()}%` });
    }
    if (user_email) {
      qb.andWhere('search_log.user_email = :user_email', { user_email });
    }
    if (subject_filter) {
      qb.andWhere('search_log.subject_filter = :subject_filter', { subject_filter });
    }
    if (level_filter) {
      qb.andWhere('search_log.level_filter = :level_filter', { level_filter });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const entry = await this.searchLogRepository.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Search log entry not found');
    }
    return entry;
  }
}
