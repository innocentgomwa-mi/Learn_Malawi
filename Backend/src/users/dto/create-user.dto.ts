import { IsString, IsEmail, IsEnum, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
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
  @MaxLength(150)
  school?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PSLC', 'JCE', 'MSCE'])
  level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  profileImageUrl?: string;

  @IsEnum(UserRole)
  role: UserRole;
}


