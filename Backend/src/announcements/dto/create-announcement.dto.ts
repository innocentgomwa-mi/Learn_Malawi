import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateAnnouncementDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @Transform(({ value, obj }) => value ?? obj.message)
  @IsNotEmpty()
  @IsString()
  body: string;

  @Transform(({ value, obj }) => value ?? obj.target_audience)
  @IsOptional()
  @IsString()
  @IsIn(['all', 'students', 'teachers'])
  targetAudience?: string;

  @Transform(({ value, obj }) => value ?? obj.priority)
  @IsOptional()
  @IsString()
  @IsIn(['low', 'normal', 'high'])
  priority?: string;

  @Transform(({ value, obj }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value ?? obj.is_published;
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @Transform(({ value, obj }) => value ?? obj.teacher_email)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  teacherEmail?: string;

  @Transform(({ value, obj }) => value ?? obj.link)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  link?: string;
}
