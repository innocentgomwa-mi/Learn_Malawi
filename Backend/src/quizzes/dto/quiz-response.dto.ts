// src/quizzes/dto/quiz-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
<<<<<<< HEAD
import { EducationLevel, Difficulty, QuizStatus } from '../entities/quiz.entity';
=======
import { EducationLevel, Difficulty } from '../entities/quiz.entity';
>>>>>>> 4174fba (changes to admin dashboard)

class QuestionResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  question: string;

  @ApiProperty({ type: [String] })
  @Expose()
  options: string[];

  @ApiProperty()
  @Expose()
  answer: string;

  @ApiProperty()
  @Expose()
  timeLimit: number;

  @ApiProperty()
  @Expose()
  completionTimePerQuestion: number;
}

export class QuizResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ required: false })
  @Expose()
<<<<<<< HEAD
  description?: string;
=======
  description?: string; // ADD THIS LINE
>>>>>>> 4174fba (changes to admin dashboard)

  @ApiProperty({ enum: EducationLevel })
  @Expose()
  level: EducationLevel;

  @ApiProperty()
  @Expose()
  subject: string;

  @ApiProperty({ enum: Difficulty })
  @Expose()
  difficulty: Difficulty;

  @ApiProperty()
  @Expose()
  class: string;

<<<<<<< HEAD
  @ApiProperty({ example: 'uploaded', enum: QuizStatus })
  @Expose()
  status: QuizStatus;

=======
>>>>>>> 4174fba (changes to admin dashboard)
  @ApiProperty({ type: [QuestionResponseDto] })
  @Expose()
  @Type(() => QuestionResponseDto)
  questions: QuestionResponseDto[];

  @ApiProperty()
  @Expose()
  totalTime: number;
}