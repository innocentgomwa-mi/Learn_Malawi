import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ example: 'Calculus Textbook chapter 5' })
  name: string;

  @ApiProperty({ example: 'textbook', required: false })
  type?: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  subject?: string;

  @ApiProperty({ example: 'https://example.com', required: false })
  url?: string;
}
