import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateStudentProgressDto } from './dto/create-student-progress.dto';
import { UpdateStudentProgressDto } from './dto/update-student-progress.dto';
import { StudentProgress } from './entities/student-progress.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(StudentProgress)
    private readonly studentProgressRepository: Repository<StudentProgress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createStudentProgressDto: CreateStudentProgressDto) {
    const { student_email, entry_type, resource_id, resource_type } = createStudentProgressDto;
    let entry: StudentProgress | null = null;

    if (student_email && entry_type === 'study' && resource_id && resource_type) {
      entry = await this.studentProgressRepository.findOne({
        where: {
          student_email,
          entry_type,
          resource_id,
          resource_type,
        },
      });
    }

    if (!entry && student_email && entry_type === 'quiz' && createStudentProgressDto.quiz_id) {
      entry = await this.studentProgressRepository.findOne({
        where: {
          student_email,
          entry_type,
          quiz_id: createStudentProgressDto.quiz_id,
        },
      });
    }

    if (entry) {
      Object.assign(entry, createStudentProgressDto);
      return this.studentProgressRepository.save(entry);
    }

    const newEntry = this.studentProgressRepository.create(createStudentProgressDto);
    return this.studentProgressRepository.save(newEntry);
  }

  async findAll(studentEmail?: string, entryType?: string, level?: string, subject?: string) {
    const where: any = {};
    if (studentEmail) where.student_email = studentEmail;
    if (entryType) where.entry_type = entryType;
    if (level) where.level = level;
    if (subject) where.subject = subject;

    const entries = await this.studentProgressRepository.find({ where, order: { createdDate: 'DESC' } });
    const emails = Array.from(new Set(entries.map((entry) => entry.student_email).filter(Boolean)));
    if (emails.length > 0) {
      const users = await this.userRepository.findBy({ email: In(emails) });
      const userNameMap = new Map(users.map((user) => [user.email, `${user.firstName} ${user.lastName}`.trim()]));
      entries.forEach((entry) => {
        entry.student_name = userNameMap.get(entry.student_email) || entry.student_email;
      });
    }

    return entries;
  }

  async findOne(id: string) {
    const entry = await this.studentProgressRepository.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Student progress entry not found');
    }
    return entry;
  }

  async update(id: string, updateStudentProgressDto: UpdateStudentProgressDto) {
    const entry = await this.findOne(id);
    Object.assign(entry, updateStudentProgressDto);
    return this.studentProgressRepository.save(entry);
  }

  async remove(id: string) {
    const entry = await this.findOne(id);
    await this.studentProgressRepository.remove(entry);
    return { message: 'Student progress entry deleted successfully' };
  }
}
