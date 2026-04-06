import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  author: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;
}
