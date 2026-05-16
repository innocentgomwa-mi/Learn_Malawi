import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AttendanceRecord } from './attendance-record.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  course!: string;

  @Column({ name: 'class_level', length: 100, nullable: true })
  classLevel?: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'teacher_email', length: 255 })
  teacherEmail!: string;

  @OneToMany(() => AttendanceRecord, (record) => record.attendance, {
    cascade: true,
    eager: true,
  })
  records?: AttendanceRecord[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
