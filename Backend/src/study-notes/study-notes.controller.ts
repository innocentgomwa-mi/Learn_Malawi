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
  UploadedFiles,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { StudyNotesService } from './study-notes.service';
import { EmbeddingService } from '../ai/embedding.service';
import { PdfExtractorService } from '../ai/pdf-extractor.service';
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

const uploadDir = join(__dirname, '..', '..', 'uploads');
const studyNoteStorage = diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    callback(null, safeName);
  },
});

const studyNoteFileFilter = (_req, file, callback) => {
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];

  if (file.fieldname === 'file' && !allowedDocTypes.includes(file.mimetype)) {
    return callback(new BadRequestException('Only PDF and Word documents are allowed for study note files.'), false);
  }
  if (file.fieldname === 'image' && !allowedImageTypes.includes(file.mimetype)) {
    return callback(new BadRequestException('Only PNG, JPEG, and WEBP images are allowed for study note cards.'), false);
  }
  callback(null, true);
};

@Controller('study-notes')
@UseInterceptors(ClassSerializerInterceptor)
export class StudyNotesController {
  constructor(
    private readonly studyNotesService: StudyNotesService,
    private readonly embeddingService: EmbeddingService,
    private readonly pdfExtractorService: PdfExtractorService,
  ) {}

  private toResponseDto(note: any): StudyNoteResponseDto {
    return plainToInstance(StudyNoteResponseDto, note, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'file', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ],
    { storage: studyNoteStorage, fileFilter: studyNoteFileFilter },
  ))
  async create(
    @User() user: any,
    @UploadedFiles() files: { file?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Body() createStudyNoteDto: CreateStudyNoteDto,
  ): Promise<StudyNoteResponseDto> {
    const payload = {
      ...createStudyNoteDto,
      teacherEmail: user?.email,
      fileUrl: createStudyNoteDto.fileUrl,
      imageUrl: createStudyNoteDto.imageUrl,
    };
    if (files?.file?.[0]) {
      payload.fileUrl = `/uploads/${files.file[0].filename}`;
    }
    if (files?.image?.[0]) {
      payload.imageUrl = `/uploads/${files.image[0].filename}`;
    }
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
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'file', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ],
    { storage: studyNoteStorage, fileFilter: studyNoteFileFilter },
  ))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { file?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Body() updateStudyNoteDto: UpdateStudyNoteDto,
  ): Promise<StudyNoteResponseDto> {
    const payload = {
      ...updateStudyNoteDto,
    };
    if (files?.file?.[0]) {
      payload.fileUrl = `/uploads/${files.file[0].filename}`;
    }
    if (files?.image?.[0]) {
      payload.imageUrl = `/uploads/${files.image[0].filename}`;
    }
    const note = await this.studyNotesService.update(id, payload);
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
