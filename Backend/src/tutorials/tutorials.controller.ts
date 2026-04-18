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
<<<<<<< HEAD
  Req,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
=======
} from '@nestjs/common';
>>>>>>> 4174fba (changes to admin dashboard)
import { TutorialsService } from './tutorials.service';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { TutorialResponseDto } from './dto/tutorial-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
<<<<<<< HEAD
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { buildFileUrl, fileStorageOptions } from '../common/file-upload.util';
=======
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
>>>>>>> 4174fba (changes to admin dashboard)

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
<<<<<<< HEAD
  @UseInterceptors(FileInterceptor('file', fileStorageOptions('tutorials', 'videos')))
  async create(
    @Req() req: Request,
    @Body() createTutorialDto: CreateTutorialDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<TutorialResponseDto> {
    if (file) {
      createTutorialDto.videoUrl = buildFileUrl(req, 'tutorials', file.filename);
    }
    const tutorial = await this.tutorialsService.create(createTutorialDto);
    return this.toResponseDto(tutorial);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file', fileStorageOptions('tutorials', 'videos')))
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateTutorialDto: UpdateTutorialDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<TutorialResponseDto> {
    if (file) {
      updateTutorialDto.videoUrl = buildFileUrl(req, 'tutorials', file.filename);
    }
    const tutorial = await this.tutorialsService.update(+id, updateTutorialDto);
=======
  async create(
    @User() user: any,
    @Body() createTutorialDto: CreateTutorialDto,
  ): Promise<TutorialResponseDto> {
    const payload = {
      ...createTutorialDto,
      teacherEmail: user?.email,
    };
    const tutorial = await this.tutorialsService.create(payload as any);
>>>>>>> 4174fba (changes to admin dashboard)
    return this.toResponseDto(tutorial);
  }

  @Get()
  @Public()
  async findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('class') classFilter?: string,
<<<<<<< HEAD
  ): Promise<TutorialResponseDto[]> {
    const tutorials = await this.tutorialsService.findAll(level, subject, classFilter);
=======
    @Query('teacher_email') teacherEmail?: string,
  ): Promise<TutorialResponseDto[]> {
    const tutorials = await this.tutorialsService.findAll(level, subject, classFilter, teacherEmail);
>>>>>>> 4174fba (changes to admin dashboard)
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

<<<<<<< HEAD
=======
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(
    @Param('id') id: string,
    @Body() updateTutorialDto: UpdateTutorialDto,
  ): Promise<TutorialResponseDto> {
    const tutorial = await this.tutorialsService.update(+id, updateTutorialDto);
    return this.toResponseDto(tutorial);
  }

>>>>>>> 4174fba (changes to admin dashboard)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.tutorialsService.remove(+id);
  }
}