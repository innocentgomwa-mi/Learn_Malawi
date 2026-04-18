import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStudentProgressDto {
  @ApiProperty()
  @IsString()
  student_email: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  level: string;

  @ApiProperty()
  @IsNumber()
  average_score: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
