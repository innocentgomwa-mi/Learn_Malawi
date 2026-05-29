import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DiscussionComment = {
  author: string;
  message: string;
  createdAt: string;
};

@Entity('discussions')
export class Discussion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'teacher_email', length: 255 })
  teacherEmail!: string;

  @Column({ type: 'jsonb', nullable: true })
  comments!: DiscussionComment[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
