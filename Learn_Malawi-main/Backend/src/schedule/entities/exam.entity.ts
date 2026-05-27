import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ type: 'timestamptz', nullable: true })
  exam_date?: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'json', nullable: true })
  notify_days_before?: number[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  user_email?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}
