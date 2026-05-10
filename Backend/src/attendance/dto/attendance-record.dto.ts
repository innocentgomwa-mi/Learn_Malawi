import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class AttendanceRecordDto {
  @ApiProperty({ example: 'student-uuid-123', required: false })
  @IsString()
  @IsOptional()
  student_id?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  student_name!: string;

  @ApiProperty({ example: 'class-123', required: false })
  @IsString()
  @IsOptional()
  class_id?: string;

  @ApiProperty({ example: 'Present', enum: ['Present', 'Absent', 'Late'] })
  @IsString()
  status!: string;

  @ApiProperty({ example: '09:00', required: false })
  @IsString()
  @IsOptional()
  login_time?: string;

  @ApiProperty({ example: '10:00', required: false })
  @IsString()
  @IsOptional()
  logout_time?: string;

  @ApiProperty({ example: 60, required: false })
  @IsInt()
  @IsOptional()
  duration?: number;

  @ApiProperty({ example: 'In class', required: false })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ example: 85, required: false, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  engagement_score?: number;

  @ApiProperty({ example: 'Joined late due to network issue', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
