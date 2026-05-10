import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceRecordDto } from './attendance-record.dto';

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

  @ApiProperty({
    example: [
      {
        student_name: 'John Doe',
        status: 'Present',
        student_id: 'student-1',
        class_id: 'class-1',
        login_time: '08:00',
        logout_time: '09:00',
        duration: 60,
        method: 'In class',
        engagement_score: 90,
        reason: 'On time',
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  @IsArray()
  records: AttendanceRecordDto[];
}
