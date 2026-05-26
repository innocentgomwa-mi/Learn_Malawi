import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateDataChangeHistoryDto {
  @ApiProperty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsString()
  entity_type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entity_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  performed_by_email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  performed_by_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  before_data?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  after_data?: string;
}
