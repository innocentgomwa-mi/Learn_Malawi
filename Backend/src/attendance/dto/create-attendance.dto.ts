import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  course: string;

  @ApiProperty({ example: 'Form 1', required: false })
  @IsString()
  @IsOptional()
  class_level?: string;

  @ApiProperty({ example: '2026-04-06' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'teacher@example.com' })
  @IsString()
  @IsNotEmpty()
  teacher_email: string;

  @ApiProperty({ example: [{ student_name: 'John Doe', status: 'Present' }] })
  @IsArray()
  records: any[];
}
