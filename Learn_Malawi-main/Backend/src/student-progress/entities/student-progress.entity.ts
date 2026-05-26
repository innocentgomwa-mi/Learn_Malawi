import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('student_progress')
export class StudentProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_email: string;

  student_name?: string;

  @Column({ default: 'study' })
  entry_type: string;

  @Column({ nullable: true })
  resource_id?: string;

  @Column({ nullable: true })
  resource_type?: string;

  @Column({ nullable: true })
  resource_title?: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  quiz_id?: string;

  @Column({ nullable: true })
  quiz_title?: string;

  @Column({ type: 'float', nullable: true })
  score?: number;

  @Column({ type: 'int', nullable: true })
  total_questions?: number;

  @Column({ type: 'int', nullable: true })
  correct_answers?: number;

  @Column({ type: 'json', nullable: true })
  topics_failed?: string[];

  @Column({ type: 'timestamptz', nullable: true })
  completed_at?: Date;

  @Column({ nullable: true })
  subject?: string;

  @Column({ nullable: true })
  level?: string;

  @Column({ type: 'float', nullable: true })
  average_score?: number;

  @Column({ type: 'text', nullable: true })
  remark?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}
