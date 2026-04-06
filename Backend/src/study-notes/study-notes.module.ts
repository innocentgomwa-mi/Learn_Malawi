import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyNotesService } from './study-notes.service';
import { StudyNotesController } from './study-notes.controller';
import { StudyNote } from './entities/study-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyNote])],
  controllers: [StudyNotesController],
  providers: [StudyNotesService],
  exports: [StudyNotesService],
})
export class StudyNotesModule {}
