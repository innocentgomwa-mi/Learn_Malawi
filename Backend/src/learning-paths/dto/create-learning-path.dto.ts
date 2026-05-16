import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';

class LearningPathMilestoneDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resource_ids?: string[];

  @IsOptional()
  order?: number;
}

export class CreateLearningPathDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  subject!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  level!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LearningPathMilestoneDto)
  milestones?: LearningPathMilestoneDto[];

  @Transform(({ value, obj }) => value ?? obj.teacher_email)
  @IsOptional()
  @IsString()
  teacherEmail?: string;
}
