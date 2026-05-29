import { EducationLevel, Difficulty } from '../../common/enums';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Question } from './question.entity';



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

  @Column({ name: 'teacher_email', type: 'varchar', length: 255, nullable: true })
  teacherEmail?: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.EASY
  })
  difficulty: Difficulty;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tag: string;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true, eager: true })
  questions: Question[];

  @Column({ type: 'int', default: 0 })
  totalTime: number;
}export { EducationLevel, Difficulty } from '../../common/enums';
