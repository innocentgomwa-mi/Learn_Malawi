import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyNoteDto } from './create-study-note.dto';

export class UpdateStudyNoteDto extends PartialType(CreateStudyNoteDto) {}
