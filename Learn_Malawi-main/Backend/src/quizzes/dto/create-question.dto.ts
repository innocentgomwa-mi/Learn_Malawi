import { IsString, IsArray, IsNumber, Min, Max, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is 1 + 1?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['1', '2', '3', '4'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: '2' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(300)
  @Transform(({ value }) => Number(value) || 30)
  timeLimit?: number = 30;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => Number(value) || 0)
  completionTimePerQuestion?: number = 0;
}
