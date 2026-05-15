import { Injectable, NotFoundException, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyBlock } from './entities/study-block.entity';
import { Resource } from './entities/resource.entity';
import { Exam } from './entities/exam.entity';
import { ClassSchedule } from './entities/class-schedule.entity';
import { CreateStudyBlockDto } from './dto/create-study-block.dto';
import { UpdateStudyBlockDto } from './dto/update-study-block.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import { EmailService } from '../auth/email.service';

@Injectable()
export class ScheduleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScheduleService.name);
  private reminderCheckInterval?: NodeJS.Timeout;
  private readonly sentReminderKeys = new Set<string>();

  constructor(
    @InjectRepository(StudyBlock)
    private readonly studyBlockRepository: Repository<StudyBlock>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(ClassSchedule)
    private readonly classScheduleRepository: Repository<ClassSchedule>,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log('ScheduleService initialized');
  }

  onModuleDestroy() {
    if (this.reminderCheckInterval) {
      clearInterval(this.reminderCheckInterval);
      this.reminderCheckInterval = undefined;
    }
    this.logger.log('ScheduleService destroyed');
  }

  async createStudyBlock(createStudyBlockDto: CreateStudyBlockDto, userEmail?: string): Promise<StudyBlock> {
    const block = this.studyBlockRepository.create({
      ...createStudyBlockDto,
      user_email: userEmail,
    });
    return this.studyBlockRepository.save(block);
  }

  async findAllStudyBlocks(userEmail?: string): Promise<StudyBlock[]> {
    const where = userEmail ? { user_email: userEmail } : {};
    return this.studyBlockRepository.find({ where, order: { day_of_week: 'ASC', start_time: 'ASC' } });
  }

  async findStudyBlock(id: string, userEmail?: string): Promise<StudyBlock> {
    const where = userEmail ? { id, user_email: userEmail } : { id };
    const block = await this.studyBlockRepository.findOne({ where });
    if (!block) {
      throw new NotFoundException(`Study block with ID ${id} not found`);
    }
    return block;
  }

  async updateStudyBlock(id: string, updateStudyBlockDto: UpdateStudyBlockDto, userEmail?: string): Promise<StudyBlock> {
    const block = await this.findStudyBlock(id, userEmail);
    Object.assign(block, updateStudyBlockDto);
    return this.studyBlockRepository.save(block);
  }

  async removeStudyBlock(id: string, userEmail?: string): Promise<void> {
    const block = await this.findStudyBlock(id, userEmail);
    await this.studyBlockRepository.remove(block);
  }

  async createResource(createResourceDto: CreateResourceDto, userEmail?: string): Promise<Resource> {
    const resource = this.resourceRepository.create({
      ...createResourceDto,
      user_email: userEmail,
    });
    return this.resourceRepository.save(resource);
  }

  async findAllResources(userEmail?: string): Promise<Resource[]> {
    const where = userEmail ? { user_email: userEmail } : {};
    return this.resourceRepository.find({ where, order: { createdDate: 'DESC' } });
  }

  async findResource(id: string, userEmail?: string): Promise<Resource> {
    const where = userEmail ? { id, user_email: userEmail } : { id };
    const resource = await this.resourceRepository.findOne({ where });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return resource;
  }

  async updateResource(id: string, updateResourceDto: UpdateResourceDto, userEmail?: string): Promise<Resource> {
    const resource = await this.findResource(id, userEmail);
    Object.assign(resource, updateResourceDto);
    return this.resourceRepository.save(resource);
  }

  async removeResource(id: string, userEmail?: string): Promise<void> {
    const resource = await this.findResource(id, userEmail);
    await this.resourceRepository.remove(resource);
  }

  async createExam(createExamDto: CreateExamDto, userEmail?: string): Promise<Exam> {
    const exam = this.examRepository.create({
      ...createExamDto,
      exam_date: createExamDto.exam_date ? new Date(createExamDto.exam_date) : undefined,
      user_email: userEmail,
    });
    return this.examRepository.save(exam);
  }

  async findAllExams(userEmail?: string): Promise<Exam[]> {
    const where = userEmail ? { user_email: userEmail } : {};
    return this.examRepository.find({ where, order: { exam_date: 'ASC' } });
  }

  async findExam(id: string, userEmail?: string): Promise<Exam> {
    const where = userEmail ? { id, user_email: userEmail } : { id };
    const exam = await this.examRepository.findOne({ where });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }

  async updateExam(id: string, updateExamDto: UpdateExamDto, userEmail?: string): Promise<Exam> {
    const exam = await this.findExam(id, userEmail);
    Object.assign(exam, updateExamDto);
    if (updateExamDto.exam_date) {
      exam.exam_date = new Date(updateExamDto.exam_date);
    }
    return this.examRepository.save(exam);
  }

  async removeExam(id: string, userEmail?: string): Promise<void> {
    const exam = await this.findExam(id, userEmail);
    await this.examRepository.remove(exam);
  }

  async createClassSchedule(createClassScheduleDto: CreateClassScheduleDto, userEmail?: string): Promise<ClassSchedule> {
    const schedule = this.classScheduleRepository.create({
      ...createClassScheduleDto,
      is_recurring: createClassScheduleDto.is_recurring ?? true,
      color: createClassScheduleDto.color || 'emerald',
      reminder_minutes: createClassScheduleDto.reminder_minutes ?? 0,
      teacher_email: userEmail,
    });
    const savedSchedule = await this.classScheduleRepository.save(schedule);
    if (savedSchedule.teacher_email) {
      await this.emailService.sendEmail(
        savedSchedule.teacher_email,
        `Class schedule created: ${savedSchedule.title}`,
        `Your class schedule "${savedSchedule.title}" on ${savedSchedule.day_of_week} at ${savedSchedule.start_time} has been created. You will receive an email reminder ${savedSchedule.reminder_minutes} minutes before the class starts.`,
      );
    }
    return savedSchedule;
  }

  async findAllClassSchedules(userEmail?: string): Promise<ClassSchedule[]> {
    const where = userEmail ? { teacher_email: userEmail } : {};
    return this.classScheduleRepository.find({ where, order: { day_of_week: 'ASC', start_time: 'ASC' } });
  }

  async findClassSchedule(id: string, userEmail?: string): Promise<ClassSchedule> {
    const where = userEmail ? { id, teacher_email: userEmail } : { id };
    const schedule = await this.classScheduleRepository.findOne({ where });
    if (!schedule) {
      throw new NotFoundException(`Class schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async updateClassSchedule(id: string, updateClassScheduleDto: UpdateClassScheduleDto, userEmail?: string): Promise<ClassSchedule> {
    const schedule = await this.findClassSchedule(id, userEmail);
    Object.assign(schedule, updateClassScheduleDto);
    return this.classScheduleRepository.save(schedule);
  }

  async removeClassSchedule(id: string, userEmail?: string): Promise<void> {
    const schedule = await this.findClassSchedule(id, userEmail);
    await this.classScheduleRepository.remove(schedule);
  }
}
