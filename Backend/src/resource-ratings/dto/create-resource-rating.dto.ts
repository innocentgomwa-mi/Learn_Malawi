import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateResourceRatingDto {
  @ApiProperty()
  @IsString()
  resource_id: string;

  @ApiProperty()
  @IsString()
  user_email: string;

  @ApiProperty()
  @IsNumber()
  rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
