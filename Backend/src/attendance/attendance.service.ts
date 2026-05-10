import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create({
      course: createAttendanceDto.course,
      classLevel: createAttendanceDto.class_level,
      date: createAttendanceDto.date,
      teacherEmail: createAttendanceDto.teacher_email,
      records: (createAttendanceDto.records || []).map((record) => ({
        ...record,
        date: createAttendanceDto.date,
      })),
    });
    return this.attendanceRepository.save(attendance);
  }

  async findAll(
    teacherEmail?: string,
    course?: string,
    date?: string,
  ): Promise<Attendance[]> {
    const query = this.attendanceRepository.createQueryBuilder('attendance');

    if (teacherEmail) {
      query.andWhere('attendance.teacherEmail = :teacherEmail', {
        teacherEmail,
      });
    }

    if (course) {
      query.andWhere('attendance.course ILIKE :course', {
        course: `%${course}%`,
      });
    }

    if (date) {
      query.andWhere('attendance.date = :date', { date });
    }

    return query.orderBy('attendance.date', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return attendance;
  }

  async update(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, {
      course: updateAttendanceDto.course ?? attendance.course,
      classLevel: updateAttendanceDto.class_level ?? attendance.classLevel,
      date: updateAttendanceDto.date ?? attendance.date,
      teacherEmail:
        updateAttendanceDto.teacher_email ?? attendance.teacherEmail,
      records: updateAttendanceDto.records
        ? updateAttendanceDto.records.map((record) => ({
            ...record,
            date: updateAttendanceDto.date ?? attendance.date,
          }))
        : attendance.records,
    });
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }
}
