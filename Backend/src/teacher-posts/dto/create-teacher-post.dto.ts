import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class CreateTeacherPostDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content_type: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  level: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: 'pending' })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  author_email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  author_name?: string;
}
