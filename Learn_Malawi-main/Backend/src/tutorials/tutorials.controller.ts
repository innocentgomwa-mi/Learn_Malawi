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
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { join } from 'path';
import { TutorialsService } from './tutorials.service';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { TutorialResponseDto } from './dto/tutorial-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';

const uploadDir = join(__dirname, '..', '..', 'uploads');
const tutorialStorage = diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    callback(null, safeName);
  },
});

const tutorialFileFilter = (_req, file, callback) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new BadRequestException('Only MP4, WEBM, MOV and MKV video files are allowed.'), false);
  }
  callback(null, true);
};

@Controller('tutorials')
@UseInterceptors(ClassSerializerInterceptor)
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  private toResponseDto(tutorial: any): TutorialResponseDto {
    return plainToInstance(TutorialResponseDto, tutorial, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileFieldsInterceptor(
    [{ name: 'video', maxCount: 1 }],
    { storage: tutorialStorage, fileFilter: tutorialFileFilter },
  ))
  async create(
    @Req() req: Request,
    @User() user: any,
    @UploadedFiles() files: { video?: Express.Multer.File[] },
    @Body() createTutorialDto: CreateTutorialDto,
  ): Promise<TutorialResponseDto> {
    const normalizedVideoUrl = typeof createTutorialDto.videoUrl === 'string'
      ? createTutorialDto.videoUrl.trim() || undefined
      : createTutorialDto.videoUrl;

    const payload = {
      ...createTutorialDto,
      teacherEmail: user?.email,
      videoUrl: normalizedVideoUrl,
    };

    if (files?.video?.[0]) {
      payload.videoUrl = `${req.protocol}://${req.get('host')}/uploads/${files.video[0].filename}`;
    }

    if (!payload.videoUrl) {
      throw new BadRequestException('Video URL or uploaded file is required.');
    }

    const tutorial = await this.tutorialsService.create(payload as any);
    return this.toResponseDto(tutorial);
  }

  @Get()
  @Public()
  async findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('class') classFilter?: string,
    @Query('teacher_email') teacherEmail?: string,
  ): Promise<TutorialResponseDto[]> {
    const tutorials = await this.tutorialsService.findAll(level, subject, classFilter, teacherEmail);
    return tutorials.map(tutorial => this.toResponseDto(tutorial));
  }

  @Get('levels')
  @Public()
  async getLevels(): Promise<{ levels: string[] }> {
    const levels = await this.tutorialsService.getLevels();
    return { levels };
  }

  @Get('subjects')
  @Public()
  async getSubjects(@Query('level') level?: string): Promise<{ subjects: string[] }> {
    const subjects = await this.tutorialsService.getSubjects(level);
    return { subjects };
  }

  @Get('classes')
  @Public()
  async getClasses(@Query('level') level?: string): Promise<{ classes: string[] }> {
    const classes = await this.tutorialsService.getClasses(level);
    return { classes };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<TutorialResponseDto> {
    const tutorial = await this.tutorialsService.findOne(+id);
    return this.toResponseDto(tutorial);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileFieldsInterceptor(
    [{ name: 'video', maxCount: 1 }],
    { storage: tutorialStorage, fileFilter: tutorialFileFilter },
  ))
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFiles() files: { video?: Express.Multer.File[] },
    @Body() updateTutorialDto: UpdateTutorialDto,
  ): Promise<TutorialResponseDto> {
    const normalizedVideoUrl = typeof updateTutorialDto.videoUrl === 'string'
      ? updateTutorialDto.videoUrl.trim() || undefined
      : updateTutorialDto.videoUrl;

    const payload = {
      ...updateTutorialDto,
      videoUrl: normalizedVideoUrl,
    };

    if (files?.video?.[0]) {
      payload.videoUrl = `${req.protocol}://${req.get('host')}/uploads/${files.video[0].filename}`;
    }

    const tutorial = await this.tutorialsService.update(+id, payload);
    return this.toResponseDto(tutorial);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.tutorialsService.remove(+id);
  }
}