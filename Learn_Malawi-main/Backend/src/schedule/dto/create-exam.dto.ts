import { ApiProperty } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({ example: 'Final Exam - Algebra II' })
  title: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  subject?: string;

  @ApiProperty({ example: '2026-07-01T10:00:00.000Z', required: false })
  exam_date?: string;

  @ApiProperty({ example: 'Room 301', required: false })
  location?: string;

  @ApiProperty({ example: [1, 7], type: [Number], required: false })
  notify_days_before?: number[];

  @ApiProperty({ example: 'Review equations and practice problems', required: false })
  notes?: string;

  @ApiProperty({ example: 'rose', required: false })
  color?: string;
}
