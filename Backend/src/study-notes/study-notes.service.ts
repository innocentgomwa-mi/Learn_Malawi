import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyNote } from './entities/study-note.entity';
import { CreateStudyNoteDto } from './dto/create-study-note.dto';
import { UpdateStudyNoteDto } from './dto/update-study-note.dto';

@Injectable()
export class StudyNotesService {
  constructor(
    @InjectRepository(StudyNote)
    private studyNotesRepository: Repository<StudyNote>,
  ) {}

  async create(createStudyNoteDto: CreateStudyNoteDto & { teacherEmail?: string }): Promise<StudyNote> {
    const studyNote = this.studyNotesRepository.create(createStudyNoteDto);
    return await this.studyNotesRepository.save(studyNote);
  }

  async findAll(level?: string, subject?: string, search?: string, teacherEmail?: string): Promise<StudyNote[]> {
    const query = this.studyNotesRepository.createQueryBuilder('studyNote');

    if (level && level !== 'All') {
      query.andWhere('studyNote.level = :level', { level });
    }

    if (subject) {
      query.andWhere('studyNote.subject ILIKE :subject', { subject: `%${subject}%` });
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      query.andWhere(
        `(studyNote.title ILIKE :search
          OR studyNote.subject ILIKE :search
          OR studyNote.topic ILIKE :search
          OR studyNote.summary ILIKE :search
          OR studyNote.grade ILIKE :search)`,
        { search: `%${trimmedSearch}%` },
      );
    }

    if (teacherEmail) {
      query.andWhere('studyNote.teacherEmail = :teacherEmail', { teacherEmail });
    }

    return await query.orderBy('studyNote.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<StudyNote> {
    const studyNote = await this.studyNotesRepository.findOne({ where: { id } });

    if (!studyNote) {
      throw new NotFoundException(`Study note with ID ${id} not found`);
    }

    return studyNote;
  }

  async update(id: string, updateStudyNoteDto: UpdateStudyNoteDto): Promise<StudyNote> {
    const studyNote = await this.findOne(id);
    Object.assign(studyNote, updateStudyNoteDto);
    return await this.studyNotesRepository.save(studyNote);
  }

  async remove(id: string): Promise<void> {
    const studyNote = await this.findOne(id);
    await this.studyNotesRepository.remove(studyNote);
  }
}
