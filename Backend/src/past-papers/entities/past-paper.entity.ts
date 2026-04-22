import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EducationLevel {
  PSLC = 'PSLC',
  JCE = 'JCE',
  MSCE = 'MSCE',
}

@Entity('past_papers')
export class PastPaper {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subject?: string;

  @Column({ type: 'varchar', length: 50 })
  level!: EducationLevel;

  @Column({ type: 'integer' })
  year!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  paperUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  markingSchemeUrl?: string;

  @Column({ name: 'teacher_email', type: 'varchar', length: 255, nullable: true })
  teacherEmail?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  class?: string;

  @Column({ type: 'integer', default: 0 })
  downloadCount!: number;

  @Column({ type: 'integer', default: 0 })
  viewCount!: number;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
