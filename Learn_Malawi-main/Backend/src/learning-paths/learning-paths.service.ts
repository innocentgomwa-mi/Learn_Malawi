import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';

@Injectable()
export class LearningPathsService {
  constructor(
    @InjectRepository(LearningPath)
    private learningPathsRepository: Repository<LearningPath>,
  ) {}

  async create(createLearningPathDto: CreateLearningPathDto & { teacherEmail?: string }): Promise<LearningPath> {
    const learningPath = this.learningPathsRepository.create(createLearningPathDto);
    return await this.learningPathsRepository.save(learningPath);
  }

  async findAll(level?: string, subject?: string, teacherEmail?: string, search?: string): Promise<LearningPath[]> {
    const query = this.learningPathsRepository.createQueryBuilder('learningPath');

    if (level && level !== 'All') {
      query.andWhere('learningPath.level = :level', { level });
    }

    if (subject) {
      query.andWhere('learningPath.subject ILIKE :subject', { subject: `%${subject}%` });
    }

    if (search) {
      query.andWhere(
        '(learningPath.title ILIKE :search OR learningPath.subject ILIKE :search OR learningPath.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (teacherEmail) {
      query.andWhere('learningPath.teacherEmail = :teacherEmail', { teacherEmail });
    }

    return await query.orderBy('learningPath.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<LearningPath> {
    const learningPath = await this.learningPathsRepository.findOne({ where: { id } });
    if (!learningPath) {
      throw new NotFoundException(`Learning path with ID ${id} not found`);
    }
    return learningPath;
  }

  async update(id: string, updateLearningPathDto: UpdateLearningPathDto): Promise<LearningPath> {
    const learningPath = await this.findOne(id);
    Object.assign(learningPath, updateLearningPathDto);
    return await this.learningPathsRepository.save(learningPath);
  }

  async remove(id: string): Promise<void> {
    const learningPath = await this.findOne(id);
    await this.learningPathsRepository.remove(learningPath);
  }
}
