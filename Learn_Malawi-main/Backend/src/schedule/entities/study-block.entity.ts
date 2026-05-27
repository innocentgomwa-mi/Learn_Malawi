import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('study_blocks')
export class StudyBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  day_of_week?: string;

  @Column({ nullable: true })
  start_time?: string;

  @Column({ nullable: true })
  end_time?: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ type: 'json', nullable: true })
  resource_ids?: string[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ nullable: true })
  user_email?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}
