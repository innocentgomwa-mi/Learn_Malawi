import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSharedResourceDto {
  @ApiProperty({ example: 'Form 2 Algebra Notes' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A complete set of algebra revision notes', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Study Note', required: false })
  @IsOptional()
  @IsString()
  resource_type?: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Form 2', required: false })
  @IsOptional()
  @IsString()
  class_level?: string;

  @ApiProperty({ example: 'https://example.com/resource.pdf', required: false })
  @IsOptional()
  @IsUrl({ require_tld: false })
  file_url?: string;
}
