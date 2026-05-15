import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StudyNoteResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  subject!: string;

  @ApiProperty()
  @Expose()
  level!: string;

  @ApiProperty({ required: false })
  @Expose()
  grade?: string;

  @ApiProperty({ required: false })
  @Expose()
  topic?: string;

  @ApiProperty({ required: false })
  @Expose()
  summary?: string;

  @ApiProperty({ required: false })
  @Expose()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @Expose()
  content?: string;

  @ApiProperty({ required: false })
  @Expose()
  fileUrl?: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
