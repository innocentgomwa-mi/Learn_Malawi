import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherPostDto } from './create-teacher-post.dto';

export class UpdateTeacherPostDto extends PartialType(CreateTeacherPostDto) {}
