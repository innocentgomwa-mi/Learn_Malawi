import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EducationLevel } from '../../common/enums';

export class PastPaperResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @Expose()
  subject?: string;

  @ApiProperty({ enum: EducationLevel })
  @Expose()
  level: EducationLevel;

  @ApiProperty()
  @Expose()
  year: number;

  @ApiProperty({ required: false })
  @Expose()
  paperUrl?: string;

  @ApiProperty({ required: false })
  @Expose()
  markingSchemeUrl?: string;

  @ApiProperty({ required: false })
  @Expose()
  class?: string;

  @ApiProperty()
  @Expose()
  downloadCount: number;

  @ApiProperty()
  @Expose()
  viewCount: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
