import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('teacher_posts')
export class TeacherPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content_type: string;

  @Column()
  subject: string;

  @Column()
  level: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  author_email?: string;

  @Column({ nullable: true })
  author_name?: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;
}
