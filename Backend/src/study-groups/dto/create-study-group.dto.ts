import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayUnique, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudyGroupDto {
  @ApiProperty({ example: 'Physics Revision Group' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Physics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subject: string;

  @ApiProperty({ example: 'MSCE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  level: string;

  @ApiProperty({ example: 'Prepare for the final exam', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: '/uploads/group-icon.png', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  icon_url?: string;

  @ApiProperty({ example: '2026-05-01 18:00', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  scheduled_at?: string;

  @ApiProperty({ example: 'teacher@school.mw' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  mentor_email: string;

  @ApiProperty({ example: 'Mr. Banda', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  mentor_name?: string;

  @ApiProperty({ example: ['student1@example.com'], required: false })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  members?: string[];
}
