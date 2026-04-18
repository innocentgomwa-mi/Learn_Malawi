import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentProgressDto } from './dto/create-student-progress.dto';
import { UpdateStudentProgressDto } from './dto/update-student-progress.dto';
import { StudentProgress } from './entities/student-progress.entity';

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(StudentProgress)
    private readonly studentProgressRepository: Repository<StudentProgress>,
  ) {}

  create(createStudentProgressDto: CreateStudentProgressDto) {
    const entry = this.studentProgressRepository.create(createStudentProgressDto);
    return this.studentProgressRepository.save(entry);
  }

  findAll(studentEmail?: string) {
    const where = studentEmail ? { student_email: studentEmail } : {};
    return this.studentProgressRepository.find({ where, order: { createdDate: 'DESC' } });
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
