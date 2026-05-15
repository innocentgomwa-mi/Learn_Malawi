import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateStudyBlockDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() day_of_week: string;
  @IsString() @IsNotEmpty() start_time: string;
  @IsString() @IsNotEmpty() end_time: string;
  @IsString() @IsOptional() subject?: string;
  @IsString() @IsOptional() color?: string;
  @IsArray() @IsOptional() resource_ids?: string[];
  @IsString() @IsOptional() notes?: string;
}
