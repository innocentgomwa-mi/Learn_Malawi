import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('student_progress')
export class StudentProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_email: string;

  @Column()
  subject: string;

  @Column()
  level: string;

  @Column('float')
  average_score: number;

  @Column({ type: 'text', nullable: true })
  remark?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}
