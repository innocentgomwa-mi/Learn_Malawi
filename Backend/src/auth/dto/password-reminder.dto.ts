import { IsInt, IsIn, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PasswordReminderDto {
  @IsString()
  @IsIn(['all', 'students', 'teachers'])
  targetAudience: 'all' | 'students' | 'teachers' = 'all';

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAgeDays = 30;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  subject?: string;
}
