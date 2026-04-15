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
} from '@nestjs/common';
import { StudyNotesService } from './study-notes.service';
import { CreateStudyNoteDto } from './dto/create-study-note.dto';
import { UpdateStudyNoteDto } from './dto/update-study-note.dto';
import { StudyNoteResponseDto } from './dto/study-note-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';

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
  async create(
    @User() user: any,
    @Body() createStudyNoteDto: CreateStudyNoteDto,
  ): Promise<StudyNoteResponseDto> {
    const payload = {
      ...createStudyNoteDto,
      teacherEmail: user?.email,
    };
    const note = await this.studyNotesService.create(payload as any);
    return this.toResponseDto(note);
  }

  @Get()
  @Public()
  async findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('search') search?: string,
    @Query('teacher_email') teacherEmail?: string,
  ): Promise<StudyNoteResponseDto[]> {
    const notes = await this.studyNotesService.findAll(level, subject, search, teacherEmail);
    return notes.map((note) => this.toResponseDto(note));
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<StudyNoteResponseDto> {
    const note = await this.studyNotesService.findOne(id);
    return this.toResponseDto(note);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(
    @Param('id') id: string,
    @Body() updateStudyNoteDto: UpdateStudyNoteDto,
  ): Promise<StudyNoteResponseDto> {
    const note = await this.studyNotesService.update(id, updateStudyNoteDto);
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
