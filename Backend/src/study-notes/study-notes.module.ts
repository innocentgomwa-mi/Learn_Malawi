import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyNotesService } from './study-notes.service';
import { StudyNotesController } from './study-notes.controller';
import { StudyNote } from './entities/study-note.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudyNote]), AiModule],
  controllers: [StudyNotesController],
  providers: [StudyNotesService],
  exports: [StudyNotesService],
})
export class StudyNotesModule {}
