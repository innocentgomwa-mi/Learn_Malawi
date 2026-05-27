import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9]{6}$/)
  code: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
