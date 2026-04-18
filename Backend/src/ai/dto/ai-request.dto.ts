import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum AIFeature {
  TUTOR = 'tutor',
  QUIZ_EXPLAIN = 'quiz_explain',
  SUMMARISE = 'summarise',
  CAREER_ADVICE = 'career_advice',
  PAST_PAPER = 'past_paper',
}

export class AIRequestDto {
  @IsEnum(AIFeature)
  feature: AIFeature;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  context?: string;
}
