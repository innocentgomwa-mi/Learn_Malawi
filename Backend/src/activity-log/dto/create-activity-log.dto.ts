import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty()
  @IsString()
  action: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resource_title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  metadata?: string;
}
