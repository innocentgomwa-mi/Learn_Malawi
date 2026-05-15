import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateExamDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() subject: string;
  @IsDateString() exam_date: string;
  @IsString() @IsOptional() location?: string;
  @IsArray() @IsOptional() notify_days_before?: number[];
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() color?: string;
}
