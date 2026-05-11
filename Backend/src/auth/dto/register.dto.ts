import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsIn, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return UserRole.ADMIN;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'student') return UserRole.STUDENT;
    if (normalized === 'teacher') return UserRole.TEACHER;
    if (normalized === 'admin') return UserRole.ADMIN;
    return UserRole.ADMIN;
  })
  @IsIn([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT])
  role: UserRole = UserRole.ADMIN;
}
