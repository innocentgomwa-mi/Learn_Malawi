import { IsString, IsOptional, IsArray, ArrayUnique, MaxLength, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudyGroupDto {
  @ApiPropertyOptional({ example: 'Physics Revision Group' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Physics' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  subject?: string;

  @ApiPropertyOptional({ example: 'MSCE' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  level?: string;

  @ApiPropertyOptional({ example: 'Prepare for the final exam' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-01 18:00' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  scheduled_at?: string;

  @ApiPropertyOptional({ example: 'mentor@example.com' })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  mentor_email?: string;

  @ApiPropertyOptional({ example: 'Mr. Banda' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  mentor_name?: string;

  @ApiPropertyOptional({ example: ['student1@example.com'] })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  members?: string[];

  @ApiPropertyOptional({ example: ['student1@example.com'] })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  banned_members?: string[];
}
