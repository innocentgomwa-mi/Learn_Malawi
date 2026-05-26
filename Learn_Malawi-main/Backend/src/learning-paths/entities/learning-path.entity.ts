import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 100 })
  subject!: string;

  @Column({ type: 'varchar', length: 50 })
  level!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  milestones?: Array<{
    title: string;
    description?: string;
    resource_ids?: string[];
    order?: number;
  }>;

  @Column({ name: 'teacher_email', type: 'varchar', length: 255, nullable: true })
  teacherEmail?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
