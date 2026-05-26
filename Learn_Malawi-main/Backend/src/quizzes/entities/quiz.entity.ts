import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum EducationLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  PSLC = 'PSLC',
  JCE = 'JCE',
  MSCE = 'MSCE',
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  LEVEL1 = 'level1',
  LEVEL2 = 'level2',
  LEVEL3 = 'level3',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: EducationLevel, default: EducationLevel.PRIMARY })
  level: EducationLevel;

  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @Column({ type: 'enum', enum: Difficulty, default: Difficulty.EASY })
  difficulty: Difficulty;

  @Column({ type: 'varchar', length: 100, nullable: true })
  class?: string;

  @Column({ type: 'int', default: 0 })
  totalTime: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  teacherEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  topic?: string;

  @Column({ type: 'jsonb', default: [] })
  questions: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
