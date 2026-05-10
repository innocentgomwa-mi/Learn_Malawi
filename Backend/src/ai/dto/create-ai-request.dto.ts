import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
