import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Attendance } from './attendance.entity';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255, nullable: true })
  student_id?: string;

  @Column({ length: 255 })
  student_name!: string;

  @Column({ length: 255, nullable: true })
  class_id?: string;

  @Column({ type: 'date', nullable: true })
  date?: string;

  @Column({ length: 50, default: 'Present' })
  status!: string;

  @Column({ length: 50, nullable: true })
  login_time?: string;

  @Column({ length: 50, nullable: true })
  logout_time?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ length: 100, nullable: true })
  method?: string;

  @Column({ type: 'int', nullable: true })
  engagement_score?: number;

  @Column({ length: 500, nullable: true })
  reason?: string;

  @ManyToOne(() => Attendance, (attendance) => attendance.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attendance_id' })
  @Exclude()
  attendance!: Attendance;
}
