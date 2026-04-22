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
  Req,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { PastPapersService } from './past-papers.service';
import { CreatePastPaperDto } from './dto/create-past-paper.dto';
import { UpdatePastPaperDto } from './dto/update-past-paper.dto';
import { PastPaperResponseDto } from './dto/past-paper-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { EducationLevel } from './entities/past-paper.entity';
import { buildFileUrl, fileStorageOptions } from '../common/file-upload.util';

@Controller('past-papers')
@UseInterceptors(ClassSerializerInterceptor)
export class PastPapersController {
  constructor(private readonly pastPapersService: PastPapersService) {}

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
  ) {
    const result = await this.pastPapersService.findAll(page, limit, level, subject, year, search);
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'markingSchemeFile', maxCount: 1 },
      ],
      fileStorageOptions('past-papers', 'documents'),
    ),
  )
  async create(
    @Req() req: Request,
    @Body() createPastPaperDto: CreatePastPaperDto,
    @UploadedFiles() files?: { file?: Express.Multer.File[]; markingSchemeFile?: Express.Multer.File[] },
  ): Promise<PastPaperResponseDto> {
    if (files?.file?.[0]) {
      createPastPaperDto.paperUrl = buildFileUrl(req, 'past-papers', files.file[0].filename);
    }
    if (files?.markingSchemeFile?.[0]) {
      createPastPaperDto.markingSchemeUrl = buildFileUrl(req, 'past-papers', files.markingSchemeFile[0].filename);
    }
    const pastPaper = await this.pastPapersService.create(createPastPaperDto);
    return this.toResponseDto(pastPaper);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'markingSchemeFile', maxCount: 1 },
      ],
      fileStorageOptions('past-papers', 'documents'),
    ),
  )
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePastPaperDto: UpdatePastPaperDto,
    @UploadedFiles() files?: { file?: Express.Multer.File[]; markingSchemeFile?: Express.Multer.File[] },
  ): Promise<PastPaperResponseDto> {
    if (files?.file?.[0]) {
      updatePastPaperDto.paperUrl = buildFileUrl(req, 'past-papers', files.file[0].filename);
    }
    if (files?.markingSchemeFile?.[0]) {
      updatePastPaperDto.markingSchemeUrl = buildFileUrl(req, 'past-papers', files.markingSchemeFile[0].filename);
    }
    const pastPaper = await this.pastPapersService.update(id, updatePastPaperDto);
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
