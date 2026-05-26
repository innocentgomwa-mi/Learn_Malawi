import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() subject?: string;
  @IsOptional() url?: string;
}
