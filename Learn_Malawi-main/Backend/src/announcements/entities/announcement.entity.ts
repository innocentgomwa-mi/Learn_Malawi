import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'target_audience', length: 50, default: 'all' })
  targetAudience: string;

  @Column({ length: 50, default: 'normal' })
  priority: string;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'teacher_email', length: 255 })
  teacherEmail: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
