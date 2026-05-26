import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  subject: string;

  @Column({ type: 'timestamp' })
  exam_date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'simple-array', nullable: true })
  notify_days_before: number[];

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ default: 'rose' })
  color: string;

  @Column({ nullable: true })
  user_email: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
