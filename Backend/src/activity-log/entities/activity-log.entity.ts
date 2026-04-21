import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  user_email?: string;

  @Column({ nullable: true })
  user_name?: string;

  @Column({ nullable: true })
  user_role?: string;

  @Column({ nullable: true })
  resource_title?: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ nullable: true })
  level?: string;

  @Column({ type: 'float', nullable: true })
  score?: number;

  @Column({ type: 'int', nullable: true })
  duration_seconds?: number;

  @Column({ nullable: true })
  page_section?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;
}
