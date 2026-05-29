// src/career-resources/career-resources.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { CareerResourcesService } from './career-resources.service';
import { CreateCareerResourceDto } from './dto/create-career-resource.dto';
import { UpdateCareerResourceDto } from './dto/update-career-resource.dto';
import { CareerResourceResponseDto } from './dto/career-resource-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';

const uploadDir = join(__dirname, '..', '..', 'uploads');
const careerResourceStorage = diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    callback(null, safeName);
  },
});

const careerResourceFileFilter = (_req, file, callback) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new BadRequestException('Only MP4, WEBM, MOV and MKV video files are allowed.'), false);
  }
  callback(null, true);
};

@Controller('career-resources')
@UseInterceptors(ClassSerializerInterceptor)
export class CareerResourcesController {
  constructor(private readonly careerResourcesService: CareerResourcesService) {}

  private toResponseDto(careerResource: any): CareerResourceResponseDto {
    return plainToInstance(CareerResourceResponseDto, careerResource, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'video', maxCount: 1 }], {
      storage: careerResourceStorage,
      fileFilter: careerResourceFileFilter,
    }),
  )
  async create(
    @Req() req: Request,
    @UploadedFiles() files: { video?: Express.Multer.File[] },
    @Body() createCareerResourceDto: CreateCareerResourceDto,
  ): Promise<CareerResourceResponseDto> {
    const normalizedLink = typeof createCareerResourceDto.link === 'string'
      ? createCareerResourceDto.link.trim() || undefined
      : createCareerResourceDto.link;

    const payload: CreateCareerResourceDto = {
      ...createCareerResourceDto,
      link: normalizedLink,
    };

    if (files?.video?.[0]) {
      payload.link = `${req.protocol}://${req.get('host')}/uploads/${files.video[0].filename}`;
    }

    if (!payload.link) {
      throw new BadRequestException('Link or uploaded video file is required.');
    }

    const careerResource = await this.careerResourcesService.create(payload);
    return this.toResponseDto(careerResource);
  }

  @Get()
  @Public()
  async findAll(): Promise<CareerResourceResponseDto[]> {
    const careerResources = await this.careerResourcesService.findAll();
    return careerResources.map(resource => this.toResponseDto(resource));
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<CareerResourceResponseDto> {
    const careerResource = await this.careerResourcesService.findOne(+id);
    return this.toResponseDto(careerResource);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'video', maxCount: 1 }], {
      storage: careerResourceStorage,
      fileFilter: careerResourceFileFilter,
    }),
  )
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFiles() files: { video?: Express.Multer.File[] },
    @Body() updateCareerResourceDto: UpdateCareerResourceDto,
  ): Promise<CareerResourceResponseDto> {
    const normalizedLink = typeof updateCareerResourceDto.link === 'string'
      ? updateCareerResourceDto.link.trim() || undefined
      : updateCareerResourceDto.link;

    const payload: UpdateCareerResourceDto = {
      ...updateCareerResourceDto,
      link: normalizedLink,
    };

    if (files?.video?.[0]) {
      payload.link = `${req.protocol}://${req.get('host')}/uploads/${files.video[0].filename}`;
    }

    const careerResource = await this.careerResourcesService.update(+id, payload);
    return this.toResponseDto(careerResource);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.careerResourcesService.remove(+id);
  }
}