<<<<<<< HEAD
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsString()
  @IsOptional()
  context?: string;
}
=======
import { IsNotEmpty, IsString } from 'class-validator';
>>>>>>> 4174fba (changes to admin dashboard)

export class CreateAiRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
<<<<<<< HEAD

export class QuizDto {
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @IsNumber()
  @IsOptional()
  numQuestions?: number;

  @IsString()
  @IsOptional()
  difficulty?: string;
}

export class EducationalContentDto {
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @IsString()
  @IsOptional()
  grade?: string;
}

export class SummarizeDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @IsOptional()
  maxLength?: number;
}

export class CheckAnswerDto {
  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsString()
  @IsNotEmpty()
  studentAnswer!: string;

  @IsString()
  @IsOptional()
  correctAnswer?: string;
}

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}

export class ChatCompletionDto {
  @IsArray()
  messages!: any[];

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  max_tokens?: number;
}
=======
>>>>>>> 4174fba (changes to admin dashboard)
