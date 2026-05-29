import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { PastPapersService } from './past-papers.service';
import { EmbeddingService } from '../ai/embedding.service';
import { PdfExtractorService } from '../ai/pdf-extractor.service';
import { CreatePastPaperDto } from './dto/create-past-paper.dto';
import { UpdatePastPaperDto } from './dto/update-past-paper.dto';
import { PastPaperResponseDto } from './dto/past-paper-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { EducationLevel } from '../common/enums';

const uploadDir = join(__dirname, '..', '..', 'uploads');
const pastPaperStorage = diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    callback(null, safeName);
  },
});

const pastPaperFileFilter = (_req, file, callback) => {
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new BadRequestException('Only PDF files are allowed for past papers.'), false);
  }
  callback(null, true);
};

@Controller('past-papers')
@UseInterceptors(ClassSerializerInterceptor)
export class PastPapersController {
  constructor(
    private readonly pastPapersService: PastPapersService,
    private readonly embeddingService: EmbeddingService,
    private readonly pdfExtractorService: PdfExtractorService,
  ) {}

  private toResponseDto(pastPaper: any): PastPaperResponseDto {
    return plainToInstance(PastPaperResponseDto, pastPaper, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Public()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('level') level?: EducationLevel,
    @Query('subject') subject?: string,
    @Query('year') year?: number,
    @Query('search') search?: string,
    @Query('teacher_email') teacherEmail?: string,
  ) {
    const result = await this.pastPapersService.findAll(page, limit, level, subject, year, search, teacherEmail);
    return {
      ...result,
      data: result.data.map((pastPaper) => this.toResponseDto(pastPaper)),
    };
  }

  @Get('years')
  @Public()
  async getYears(@Query('level') level?: EducationLevel) {
    return await this.pastPapersService.getYears(level);
  }

  @Get('subjects')
  @Public()
  async getSubjects(@Query('level') level?: EducationLevel) {
    return await this.pastPapersService.getSubjects(level);
  }

  @Get('classes')
  @Public()
  async getClasses(@Query('level') level?: EducationLevel) {
    return await this.pastPapersService.getClasses(level);
  }

  @Get('latest')
  @Public()
  async getLatest(
    @Query('level') level?: EducationLevel,
    @Query('limit') limit: number = 10,
  ) {
    const pastPapers = await this.pastPapersService.getLatest(level, limit);
    return pastPapers.map((pastPaper) => this.toResponseDto(pastPaper));
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    return await this.pastPapersService.getStats();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<PastPaperResponseDto> {
    const pastPaper = await this.pastPapersService.findOne(id);
    return this.toResponseDto(pastPaper);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'paper', maxCount: 1 },
      { name: 'markingScheme', maxCount: 1 },
    ],
    { storage: pastPaperStorage, fileFilter: pastPaperFileFilter },
  ))
  async create(
    @User() user: any,
    @UploadedFiles() files: { paper?: Express.Multer.File[]; markingScheme?: Express.Multer.File[] },
    @Body() createPastPaperDto: CreatePastPaperDto,
  ): Promise<PastPaperResponseDto> {
    const payload = {
      ...createPastPaperDto,
      teacherEmail: user?.email,
      paperUrl: createPastPaperDto.paperUrl,
      markingSchemeUrl: createPastPaperDto.markingSchemeUrl,
    };

    if (files?.paper?.[0]) {
      payload.paperUrl = `/uploads/${files.paper[0].filename}`;
    }
    if (files?.markingScheme?.[0]) {
      payload.markingSchemeUrl = `/uploads/${files.markingScheme[0].filename}`;
    }

    const pastPaper = await this.pastPapersService.create(payload as any);

    if (files?.paper?.[0]?.path) {
      const filePath = files.paper[0].path;
      console.log('RAG: file path =', filePath);
      setImmediate(async () => {
        try {
          const text = await this.pdfExtractorService.extractTextFromPath(filePath);
          await this.embeddingService.embedAndStore({
            sourceId: pastPaper.id,
            sourceType: 'past_paper',
            subject: pastPaper.subject || '',
            level: pastPaper.level,
            year: pastPaper.year,
            text,
          });
          console.log(`RAG: Processed ${pastPaper.title} — ${text.length} chars`);
        } catch (e) {
          console.error('RAG processing failed:', e.message);
        }
      });
    }

    return this.toResponseDto(pastPaper);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'paper', maxCount: 1 },
      { name: 'markingScheme', maxCount: 1 },
    ],
    { storage: pastPaperStorage, fileFilter: pastPaperFileFilter },
  ))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { paper?: Express.Multer.File[]; markingScheme?: Express.Multer.File[] },
    @Body() updatePastPaperDto: UpdatePastPaperDto,
  ): Promise<PastPaperResponseDto> {
    const payload = {
      ...updatePastPaperDto,
      paperUrl: updatePastPaperDto.paperUrl,
      markingSchemeUrl: updatePastPaperDto.markingSchemeUrl,
    };

    if (files?.paper?.[0]) {
      payload.paperUrl = `/uploads/${files.paper[0].filename}`;
    }
    if (files?.markingScheme?.[0]) {
      payload.markingSchemeUrl = `/uploads/${files.markingScheme[0].filename}`;
    }

    const pastPaper = await this.pastPapersService.update(id, payload);
    return this.toResponseDto(pastPaper);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.pastPapersService.remove(id);
  }
}
