import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('study_blocks')
export class StudyBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  day_of_week: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ default: 'indigo' })
  color: string;

  @Column({ type: 'simple-array', nullable: true })
  resource_ids: string[];

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true })
  user_email: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
