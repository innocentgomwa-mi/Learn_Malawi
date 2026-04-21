import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';

export class CreateStudentProgressDto {
  @ApiProperty()
  @IsString()
  student_email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entry_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resource_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resource_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resource_title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  quiz_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  quiz_title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  total_questions?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  correct_answers?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics_failed?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  average_score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
