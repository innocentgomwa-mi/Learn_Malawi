import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { StudyNotesService } from './study-notes.service';
import { CreateStudyNoteDto } from './dto/create-study-note.dto';
import { UpdateStudyNoteDto } from './dto/update-study-note.dto';
import { StudyNoteResponseDto } from './dto/study-note-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { buildFileUrl, fileStorageOptions } from '../common/file-upload.util';

@Controller('study-notes')
@UseInterceptors(ClassSerializerInterceptor)
export class StudyNotesController {
  constructor(private readonly studyNotesService: StudyNotesService) {}

  private toResponseDto(note: any): StudyNoteResponseDto {
    return plainToInstance(StudyNoteResponseDto, note, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file', fileStorageOptions('study-notes', 'documents')))
  async create(
    @Req() req: Request,
    @Body() createStudyNoteDto: CreateStudyNoteDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<StudyNoteResponseDto> {
    if (file) {
      createStudyNoteDto.fileUrl = buildFileUrl(req, 'study-notes', file.filename);
    }
    const note = await this.studyNotesService.create(createStudyNoteDto);
    return this.toResponseDto(note);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file', fileStorageOptions('study-notes', 'documents')))
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateStudyNoteDto: UpdateStudyNoteDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<StudyNoteResponseDto> {
    if (file) {
      updateStudyNoteDto.fileUrl = buildFileUrl(req, 'study-notes', file.filename);
    }
    const note = await this.studyNotesService.update(id, updateStudyNoteDto);
    return this.toResponseDto(note);
  }

  @Get()
  @Public()
  async findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('search') search?: string,
  ): Promise<StudyNoteResponseDto[]> {
    const notes = await this.studyNotesService.findAll(level, subject, search);
    return notes.map((note) => this.toResponseDto(note));
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<StudyNoteResponseDto> {
    const note = await this.studyNotesService.findOne(id);
    return this.toResponseDto(note);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.studyNotesService.remove(id);
  }
}
