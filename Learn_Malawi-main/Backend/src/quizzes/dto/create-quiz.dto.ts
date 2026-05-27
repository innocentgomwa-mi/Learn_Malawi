import { IsString, IsEnum, IsArray, ValidateNested, IsNumber, Min, IsNotEmpty, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EducationLevel, Difficulty } from '../../common/enums';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuizDto {
  @ApiProperty({ example: 'Mathematics Standard 1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: EducationLevel, example: EducationLevel.JCE })
  @IsEnum(EducationLevel)
  @IsOptional()
  level?: EducationLevel;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ enum: Difficulty, example: Difficulty.LEVEL1 })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiProperty({ example: 'Form 3', required: false })
  @IsString()
  @IsOptional()
  class?: string;

  @ApiProperty({ type: [CreateQuestionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => Number(value) || 0)
  totalTime?: number;

  @IsString()
  @IsOptional()
  teacherEmail?: string;

  @IsString()
  @IsOptional()
  topic?: string;
}
