import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudyGroupMessageDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef' })
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty({ example: 'Hello everyone!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ example: 'Chisomo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author_name: string;

  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  author_email: string;
}
