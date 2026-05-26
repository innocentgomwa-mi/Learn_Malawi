import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, EducationLevel, Difficulty } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
  ) {}

  async create(createQuizDto: CreateQuizDto, teacherEmail?: string): Promise<Quiz> {
    const quiz = this.quizzesRepository.create({
      ...createQuizDto,
      questions: createQuizDto.questions || [],
      teacherEmail: teacherEmail || createQuizDto.teacherEmail,
    });
    return await this.quizzesRepository.save(quiz) as unknown as Quiz;
  }

  async findAll(
    level?: string,
    subject?: string,
    difficulty?: string,
    classFilter?: string,
    teacherEmail?: string,
  ): Promise<Quiz[]> {
    const query = this.quizzesRepository.createQueryBuilder('quiz');
    if (level) query.andWhere('quiz.level = :level', { level });
    if (subject) query.andWhere('quiz.subject ILIKE :subject', { subject: `%${subject}%` });
    if (difficulty) query.andWhere('quiz.difficulty = :difficulty', { difficulty });
    if (classFilter) query.andWhere('quiz.class = :class', { class: classFilter });
    if (teacherEmail) query.andWhere('quiz.teacherEmail = :teacherEmail', { teacherEmail });
    return await query.orderBy('quiz.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Quiz> {
    const quiz = await this.quizzesRepository.findOne({ where: { id } });
    if (!quiz) throw new NotFoundException(`Quiz with ID ${id} not found`);
    return quiz;
  }

  async update(id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id);
    Object.assign(quiz, updateQuizDto);
    return await this.quizzesRepository.save(quiz) as unknown as Quiz;
  }

  async remove(id: number): Promise<void> {
    const quiz = await this.findOne(id);
    await this.quizzesRepository.remove(quiz);
  }

  async getLevels(): Promise<string[]> {
    const results = await this.quizzesRepository
      .createQueryBuilder('quiz')
      .select('DISTINCT quiz.level', 'level')
      .getRawMany();
    return results.map((r) => r.level).filter(Boolean);
  }

  async getSubjects(): Promise<string[]> {
    const results = await this.quizzesRepository
      .createQueryBuilder('quiz')
      .select('DISTINCT quiz.subject', 'subject')
      .getRawMany();
    return results.map((r) => r.subject).filter(Boolean);
  }

  async getClasses(): Promise<string[]> {
    const results = await this.quizzesRepository
      .createQueryBuilder('quiz')
      .select('DISTINCT quiz.class', 'class')
      .getRawMany();
    return results.map((r) => r.class).filter(Boolean);
  }
}
