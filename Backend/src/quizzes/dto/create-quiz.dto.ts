import { IsString, IsEnum, IsArray, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { EducationLevel, Difficulty } from '../entities/quiz.entity';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EducationLevel)
  @IsOptional()
  level?: EducationLevel;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsString()
  @IsOptional()
  class?: string;

  @IsNumber()
  @IsOptional()
  totalTime?: number;

  @IsString()
  @IsOptional()
  teacherEmail?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsArray()
  @IsOptional()
  questions?: any[];
}
