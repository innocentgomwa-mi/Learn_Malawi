import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Question } from './question.entity';

export enum EducationLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

<<<<<<< HEAD
export enum QuizStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

=======
>>>>>>> 4174fba (changes to admin dashboard)
@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: EducationLevel,
    default: EducationLevel.PRIMARY
  })
  level: EducationLevel;

  @Column({ type: 'varchar', length: 100 })
  subject: string;

<<<<<<< HEAD
=======
  @Column({ name: 'teacher_email', type: 'varchar', length: 255, nullable: true })
  teacherEmail?: string;

>>>>>>> 4174fba (changes to admin dashboard)
  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.EASY
  })
  difficulty: Difficulty;

  @Column({ type: 'varchar', length: 50 })
  class: string;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true, eager: true })
  questions: Question[];

<<<<<<< HEAD
  @Column({ type: 'enum', enum: QuizStatus, default: QuizStatus.PENDING })
  status: QuizStatus;

=======
>>>>>>> 4174fba (changes to admin dashboard)
  @Column({ type: 'int', default: 0 })
  totalTime: number;
}