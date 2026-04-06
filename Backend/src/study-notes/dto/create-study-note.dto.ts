import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudyNoteDto {
  @ApiProperty({ example: 'Understanding Fractions' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subject: string;

  @ApiProperty({ example: 'PSLC' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  level: string;

  @ApiProperty({ example: 'Grade 8', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  grade?: string;

  @ApiProperty({ example: 'Fractions', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  topic?: string;

  @ApiProperty({ example: 'Learn how to add, subtract, multiply, and divide fractions.' , required: false})
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ example: 'Fractions represent parts of a whole.', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 'https://example.com/fractions.pdf', required: false })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  fileUrl?: string;
}
