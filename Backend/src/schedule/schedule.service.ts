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
    this.logger.log('ScheduleService initialized — starting schedule reminder checks');
    void this.processExamReminders();
    void this.processClassScheduleReminders();
    this.reminderCheckInterval = setInterval(() => {
      void this.processExamReminders();
      void this.processClassScheduleReminders();
    }, 60 * 1000);
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private isSameCalendarDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private buildReminderKey(examId: string, daysBefore: number): string {
    const today = this.startOfDay(new Date()).toISOString().slice(0, 10);
    return `exam:${examId}:${daysBefore}:${today}`;
  }

  private buildClassReminderKey(scheduleId: string, occurrenceDate: Date): string {
    const stamp = `${occurrenceDate.getFullYear()}-${occurrenceDate.getMonth() + 1}-${occurrenceDate.getDate()}-${occurrenceDate.getHours()}-${occurrenceDate.getMinutes()}`;
    return `class:${scheduleId}:${stamp}`;
  }

  private parseTimeOnDate(baseDate: Date, time: string): Date | null {
    if (!time || typeof time !== 'string') return null;
    const [hour, minute] = time.split(':').map((value) => Number(value));
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    const result = new Date(baseDate);
    result.setHours(hour, minute, 0, 0);
    return result;
  }

  private getNextOccurrenceForDay(dayOfWeek: string, startTime: string, now: Date): Date | null {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const targetDay = dayMap[String(dayOfWeek || '').toLowerCase()];
    if (targetDay === undefined) return null;

    const sessionDate = new Date(now);
    const daysAhead = (targetDay - now.getDay() + 7) % 7;
    sessionDate.setDate(now.getDate() + daysAhead);
    const parsed = this.parseTimeOnDate(sessionDate, startTime);
    if (!parsed) return null;

    if (parsed.getTime() <= now.getTime()) {
      parsed.setDate(parsed.getDate() + 7);
    }
    return parsed;
  }

  async processExamReminders(): Promise<void> {
    try {
      const exams = await this.examRepository.find();
      const today = this.startOfDay(new Date());

      for (const exam of exams) {
        if (!exam.exam_date || !exam.user_email) continue;

        const examDay = this.startOfDay(new Date(exam.exam_date));
        const notifyDays = Array.isArray(exam.notify_days_before) && exam.notify_days_before.length
          ? exam.notify_days_before
          : [1, 7];

        for (const daysBefore of notifyDays) {
          const reminderDay = new Date(examDay);
          reminderDay.setDate(reminderDay.getDate() - daysBefore);
          if (!this.isSameCalendarDay(reminderDay, today)) continue;

          const key = this.buildReminderKey(exam.id, daysBefore);
          if (this.sentReminderKeys.has(key)) continue;

          const whenLabel =
            daysBefore === 0 ? 'today' : daysBefore === 1 ? 'tomorrow' : `in ${daysBefore} days`;

          await this.emailService.sendEmail(
            exam.user_email,
            `Exam reminder: ${exam.title}`,
            `Hello,

This is a reminder that your exam "${exam.title}"${exam.subject ? ` (${exam.subject})` : ''} is scheduled ${whenLabel}.

Date: ${examDay.toLocaleDateString()}
${exam.location ? `Location: ${exam.location}` : ''}
${exam.notes ? `\nNotes: ${exam.notes}` : ''}

Open Learn Malawi → My Schedule to review your plan.

Good luck with your preparation!`,
          );

          this.sentReminderKeys.add(key);
          this.logger.log(`Sent exam reminder (${daysBefore}d) for ${exam.id} to ${exam.user_email}`);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Exam reminder processing failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  async processClassScheduleReminders(): Promise<void> {
    try {
      const schedules = await this.classScheduleRepository.find();
      const now = new Date();
      const lookAheadMs = 61 * 1000;

      for (const schedule of schedules) {
        if (!schedule.teacher_email || !schedule.start_time || !schedule.day_of_week) continue;
        if (!schedule.reminder_minutes || schedule.reminder_minutes <= 0) continue;

        const nextOccurrence = this.getNextOccurrenceForDay(schedule.day_of_week, schedule.start_time, now);
        if (!nextOccurrence) continue;

        const reminderTime = new Date(nextOccurrence.getTime() - schedule.reminder_minutes * 60 * 1000);
        const msUntilReminder = reminderTime.getTime() - now.getTime();
        if (msUntilReminder < 0 || msUntilReminder > lookAheadMs) continue;

        const key = this.buildClassReminderKey(schedule.id, nextOccurrence);
        if (this.sentReminderKeys.has(key)) continue;

        const startLabel = nextOccurrence.toLocaleString();
        const subject = `Class reminder: ${schedule.title}`;
        const body = `Hello,

This is a reminder for your class "${schedule.title}"${schedule.subject ? ` (${schedule.subject})` : ''}.

Starts at: ${startLabel}
Reminder lead time: ${schedule.reminder_minutes} minute(s)
${schedule.class_level ? `Class level: ${schedule.class_level}` : ''}
${schedule.notes ? `Notes: ${schedule.notes}` : ''}

Open Learn Malawi → Notifications or Teacher Schedule for details.

— Learn Malawi`;

        try {
          await this.emailService.sendEmail(schedule.teacher_email, subject, body);
          this.sentReminderKeys.add(key);
          this.logger.log(`Sent class reminder for ${schedule.id} to ${schedule.teacher_email}`);
        } catch (error) {
          this.logger.warn(
            `Unable to send class reminder to ${schedule.teacher_email}: ${error instanceof Error ? error.message : 'unknown'}`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `Class reminder processing failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
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
    const saved = await this.studyBlockRepository.save(block);
    if (userEmail) {
      try {
        await this.emailService.sendEmail(
          userEmail,
          `Study block scheduled: ${saved.title}`,
          `Hello,

You added a study block to your weekly timetable:

"${saved.title}"
${saved.subject ? `Subject: ${saved.subject}` : ''}
${saved.day_of_week ? `Day: ${saved.day_of_week}` : ''}
${saved.start_time ? `Time: ${saved.start_time}${saved.end_time ? ` – ${saved.end_time}` : ''}` : ''}

View your full schedule in Learn Malawi → My Schedule.
You will also see study reminders on your Notifications page.

— Learn Malawi`,
        );
      } catch (error) {
        this.logger.warn(
          `Unable to send study block email to ${userEmail}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
    return saved;
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

  async countResources(userEmail?: string): Promise<number> {
    const where = userEmail ? { user_email: userEmail } : {};
    return this.resourceRepository.count({ where });
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
    const saved = await this.examRepository.save(exam);
    if (userEmail) {
      await this.notifyExamScheduled(saved, userEmail, 'created');
    }
    return saved;
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
    const saved = await this.examRepository.save(exam);
    const email = userEmail || saved.user_email;
    if (email) {
      await this.notifyExamScheduled(saved, email, 'updated');
    }
    return saved;
  }

  private async notifyExamScheduled(exam: Exam, userEmail: string, action: 'created' | 'updated'): Promise<void> {
    const examDate = exam.exam_date ? new Date(exam.exam_date).toLocaleString() : 'Not set';
    const notifyDays = Array.isArray(exam.notify_days_before) ? exam.notify_days_before.join(', ') : '1, 7';
    const subject = action === 'created' ? `Exam added to your schedule: ${exam.title}` : `Exam schedule updated: ${exam.title}`;
    const body = `Hello,

Your exam "${exam.title}" has been ${action === 'created' ? 'added to' : 'updated on'} your Learn Malawi schedule.

Subject: ${exam.subject || 'General'}
Date: ${examDate}
${exam.location ? `Location: ${exam.location}` : ''}
Email reminders: ${notifyDays} day(s) before the exam.

You will also see this on your Notifications page in the app.

— Learn Malawi`;

    try {
      await this.emailService.sendEmail(userEmail, subject, body);
    } catch (error) {
      this.logger.warn(
        `Unable to send exam ${action} email to ${userEmail}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
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
