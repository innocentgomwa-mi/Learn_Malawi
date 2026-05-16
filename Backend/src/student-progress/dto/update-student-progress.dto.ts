import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentProgressDto } from './create-student-progress.dto';

export class UpdateStudentProgressDto extends PartialType(CreateStudentProgressDto) {}
