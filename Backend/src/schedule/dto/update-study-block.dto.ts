import { PartialType } from '@nestjs/swagger';
import { CreateStudyBlockDto } from './create-study-block.dto';

export class UpdateStudyBlockDto extends PartialType(CreateStudyBlockDto) {}
