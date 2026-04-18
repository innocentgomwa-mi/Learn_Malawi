<<<<<<< HEAD
import { IsString, IsEmail, IsEnum, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
=======
import { IsString, IsEmail, IsEnum, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';
>>>>>>> 4174fba (changes to admin dashboard)
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

<<<<<<< HEAD
=======
  @IsOptional()
  @IsString()
  @MaxLength(150)
  school?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PSLC', 'JCE', 'MSCE'])
  level?: string;

>>>>>>> 4174fba (changes to admin dashboard)
  @IsEnum(UserRole)
  role: UserRole;
}


