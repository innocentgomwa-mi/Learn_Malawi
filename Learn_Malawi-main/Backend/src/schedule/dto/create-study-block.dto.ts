import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayUnique } from 'class-validator';

export class CreateStudyBlockDto {
  @ApiProperty({ example: 'Math review session' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Monday', required: false })
  @IsOptional()
  @IsString()
  day_of_week?: string;

  @ApiProperty({ example: '08:30', required: false })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiProperty({ example: '09:30', required: false })
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'indigo', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: ['123', '456'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  resource_ids?: string[];

  @ApiProperty({ example: 'Practice algebra problems', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
