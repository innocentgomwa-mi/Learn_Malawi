import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PastPaper, EducationLevel } from './entities/past-paper.entity';
import { CreatePastPaperDto } from './dto/create-past-paper.dto';
import { UpdatePastPaperDto } from './dto/update-past-paper.dto';

@Injectable()
export class PastPapersService {
  constructor(
    @InjectRepository(PastPaper)
    private pastPapersRepository: Repository<PastPaper>,
  ) {}

  async create(createPastPaperDto: CreatePastPaperDto & { teacherEmail?: string }): Promise<PastPaper> {
    const pastPaper = this.pastPapersRepository.create(createPastPaperDto);
    return await this.pastPapersRepository.save(pastPaper);
  }

  async findAll(
    page: number = 1,
    limit: number = 12,
    level?: EducationLevel,
    subject?: string,
    year?: number,
    search?: string,
    teacherEmail?: string,
  ): Promise<{ data: PastPaper[]; total: number; page: number; totalPages: number }> {
    const query = this.pastPapersRepository.createQueryBuilder('pastPaper');

    if (level) {
      query.andWhere('pastPaper.level = :level', { level });
    }

    if (subject) {
      query.andWhere('pastPaper.subject ILIKE :subject', { subject: `%${subject}%` });
    }

    if (year) {
      query.andWhere('pastPaper.year = :year', { year });
    }

    if (search) {
      query.andWhere(
        '(pastPaper.title ILIKE :search OR pastPaper.subject ILIKE :search OR pastPaper.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (teacherEmail) {
      query.andWhere('pastPaper.teacherEmail = :teacherEmail', { teacherEmail });
    }

    const [data, total] = await query
      .orderBy('pastPaper.year', 'DESC')
      .addOrderBy('pastPaper.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PastPaper> {
    const pastPaper = await this.pastPapersRepository.findOne({ where: { id } });

    if (!pastPaper) {
      throw new NotFoundException(`Past paper with ID ${id} not found`);
    }

    pastPaper.viewCount += 1;
    await this.pastPapersRepository.save(pastPaper);

    return pastPaper;
  }

  async update(id: string, updatePastPaperDto: UpdatePastPaperDto): Promise<PastPaper> {
    const pastPaper = await this.findOne(id);
    Object.assign(pastPaper, updatePastPaperDto);
    return await this.pastPapersRepository.save(pastPaper);
  }

  async remove(id: string): Promise<void> {
    const pastPaper = await this.findOne(id);
    await this.pastPapersRepository.remove(pastPaper);
  }

  async getYears(level?: EducationLevel): Promise<{ year: number; count: number }[]> {
    const query = this.pastPapersRepository
      .createQueryBuilder('pastPaper')
      .select('pastPaper.year', 'year')
      .addSelect('COUNT(pastPaper.id)', 'count')
      .groupBy('pastPaper.year')
      .orderBy('pastPaper.year', 'DESC');

    if (level) {
      query.where('pastPaper.level = :level', { level });
    }

    return await query.getRawMany();
  }

  async getSubjects(level?: EducationLevel): Promise<{ subject: string; count: number }[]> {
    const query = this.pastPapersRepository
      .createQueryBuilder('pastPaper')
      .select('pastPaper.subject', 'subject')
      .addSelect('COUNT(pastPaper.id)', 'count')
      .where('pastPaper.subject IS NOT NULL')
      .groupBy('pastPaper.subject')
      .orderBy('pastPaper.subject', 'ASC');

    if (level) {
      query.andWhere('pastPaper.level = :level', { level });
    }

    return await query.getRawMany();
  }

  async getClasses(level?: EducationLevel): Promise<{ class: string; count: number }[]> {
    const query = this.pastPapersRepository
      .createQueryBuilder('pastPaper')
      .select('pastPaper.class', 'class')
      .addSelect('COUNT(pastPaper.id)', 'count')
      .where('pastPaper.class IS NOT NULL')
      .groupBy('pastPaper.class')
      .orderBy('pastPaper.class', 'ASC');

    if (level) {
      query.andWhere('pastPaper.level = :level', { level });
    }

    return await query.getRawMany();
  }

  async getLatest(level?: EducationLevel, limit: number = 10): Promise<PastPaper[]> {
    const query = this.pastPapersRepository.createQueryBuilder('pastPaper')
      .orderBy('pastPaper.createdAt', 'DESC')
      .take(limit);

    if (level) {
      query.where('pastPaper.level = :level', { level });
    }

    return await query.getMany();
  }

  async getStats(): Promise<{
    totalPastPapers: number;
    totalDownloads: number;
    totalViews: number;
    pastPapersByLevel: { level: EducationLevel; count: number }[];
    pastPapersByYear: { year: number; count: number }[];
  }> {
    const totalPastPapers = await this.pastPapersRepository.count();

    const totalDownloads = await this.pastPapersRepository
      .createQueryBuilder('pastPaper')
      .select('SUM(pastPaper.downloadCount)', 'total')
      .getRawOne();

    const totalViews = await this.pastPapersRepository
      .createQueryBuilder('pastPaper')
      .select('SUM(pastPaper.viewCount)', 'total')
      .getRawOne();

    const pastPapersByLevel = await this.pastPapersRepository
      .createQueryBuilder('pastPaper')
      .select('pastPaper.level', 'level')
      .addSelect('COUNT(pastPaper.id)', 'count')
      .groupBy('pastPaper.level')
      .getRawMany();

    const pastPapersByYear = await this.pastPapersRepository
      .createQueryBuilder('pastPaper')
      .select('pastPaper.year', 'year')
      .addSelect('COUNT(pastPaper.id)', 'count')
      .groupBy('pastPaper.year')
      .orderBy('pastPaper.year', 'DESC')
      .getRawMany();

    return {
      totalPastPapers,
      totalDownloads: parseInt(totalDownloads.total) || 0,
      totalViews: parseInt(totalViews.total) || 0,
      pastPapersByLevel,
      pastPapersByYear,
    };
  }
}
