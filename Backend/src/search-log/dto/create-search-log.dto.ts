import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

const UserRoles = ['student', 'teacher', 'admin'] as const;

export class CreateSearchLogDto {
  @ApiProperty()
  @IsString()
  query: string;

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
  @IsNumber()
  results_count?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject_filter?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  level_filter?: string;
}
