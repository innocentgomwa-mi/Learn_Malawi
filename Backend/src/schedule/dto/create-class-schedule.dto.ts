import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateClassScheduleDto {
  @ApiProperty({ example: 'Form 2 Mathematics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Form 2', required: false })
  @IsOptional()
  @IsString()
  class_level?: string;

  @ApiProperty({ example: 'Monday' })
  @IsString()
  @IsNotEmpty()
  day_of_week: string;

  @ApiProperty({ example: '08:30' })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({ example: '09:30' })
  @IsString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({ example: 'Room 5A', required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @ApiProperty({ example: 'emerald', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  reminder_minutes?: number;

  @ApiProperty({ example: 'Review chapter 6', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
