import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  sender_name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  sender_email: string;

  @ApiProperty({ example: 'Hello everyone!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'general', required: false })
  @IsOptional()
  @IsString()
  room?: string;
}
