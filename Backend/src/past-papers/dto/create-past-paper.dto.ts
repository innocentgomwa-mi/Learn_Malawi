<<<<<<< HEAD
import { Type } from 'class-transformer';
=======
>>>>>>> 4174fba (changes to admin dashboard)
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max, IsUrl } from 'class-validator';
import { EducationLevel } from '../entities/past-paper.entity';

export class CreatePastPaperDto {
  @ApiProperty({ example: 'PSLC Mathematics Paper 1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Study past exam questions and marking schemes', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ enum: EducationLevel, example: EducationLevel.PSLC })
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty({ example: 'https://example.com/pslc-2024-maths.pdf', required: false })
  @IsUrl()
  @IsOptional()
  paperUrl?: string;

  @ApiProperty({ example: 'https://example.com/pslc-2024-maths-scheme.pdf', required: false })
  @IsUrl()
  @IsOptional()
  markingSchemeUrl?: string;

  @ApiProperty({ example: 'Form 1', required: false })
  @IsString()
  @IsOptional()
  class?: string;
}
