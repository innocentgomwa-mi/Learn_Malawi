import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyBlockDto } from './create-study-block.dto';
export class UpdateStudyBlockDto extends PartialType(CreateStudyBlockDto) {}
