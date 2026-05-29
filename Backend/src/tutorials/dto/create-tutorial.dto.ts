import { Transform } from 'class-transformer';
import { IsString, IsEnum, IsNotEmpty, IsUrl, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EducationLevel } from '../../common/enums';

export class CreateTutorialDto {
  @ApiProperty({ example: 'Chemical Bonding' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Chemistry' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subject: string;

  @ApiProperty({ enum: EducationLevel, example: EducationLevel.SECONDARY })
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @ApiProperty({ example: 'Form 4' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  class: string;

  @ApiProperty({ example: 'Learn about different types of chemical bonds and how atoms combine to form molecules.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'https://www.youtube.com/embed/5gEWOh630b8', required: false })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString()
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  videoUrl?: string;
}