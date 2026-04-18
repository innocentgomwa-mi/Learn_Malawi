import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsIn, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
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

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'student') return 'Student';
    if (normalized === 'teacher') return 'Teacher';
    if (normalized === 'admin') return 'Admin';
    return value;
  })
  @IsIn([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT])
  role: UserRole;
<<<<<<< HEAD
=======

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  school: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PSLC', 'JCE', 'MSCE'])
  level: string;
>>>>>>> 4174fba (changes to admin dashboard)
}
