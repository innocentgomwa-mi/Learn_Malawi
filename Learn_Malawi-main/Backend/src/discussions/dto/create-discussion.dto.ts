import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDiscussionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  teacherEmail: string;

  @IsOptional()
  comments?: any[];
}
