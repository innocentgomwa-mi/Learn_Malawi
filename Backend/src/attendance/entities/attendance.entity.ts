import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ type: 'jsonb', nullable: true })
  records?: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
