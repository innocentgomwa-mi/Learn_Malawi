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
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
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

@Controller('career-resources')
@UseInterceptors(ClassSerializerInterceptor)
export class CareerResourcesController {
  constructor(private readonly careerResourcesService: CareerResourcesService) {}

  private toResponseDto(careerResource: any): CareerResourceResponseDto {
    return plainToInstance(CareerResourceResponseDto, careerResource, {
      excludeExtraneousValues: true,
    });
  }

  // Allow admin to optionally upload a PDF guide file. If provided, the
  // uploaded file path will be set as `guideUrl` and used as the resource link
  // when a `link` is not explicitly provided.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('guide', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', 'uploads'),
      filename: (_req, file, cb) => {
        const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        cb(null, safeName);
      }
    }),
    fileFilter: (_req, file, cb) => {
      const allowed = ['application/pdf'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException('Only PDF guides are allowed.'), false);
      }
      cb(null, true);
    }
  }))
  async create(
    @UploadedFile() guideFile: Express.Multer.File,
    @Body() createCareerResourceDto: CreateCareerResourceDto,
  ): Promise<CareerResourceResponseDto> {
    const payload: any = { ...createCareerResourceDto };
    if (guideFile) {
      payload.guideUrl = `/uploads/${guideFile.filename}`;
      if (!payload.link) payload.link = payload.guideUrl;
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
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCareerResourceDto: UpdateCareerResourceDto,
  ): Promise<CareerResourceResponseDto> {
    const careerResource = await this.careerResourcesService.update(+id, updateCareerResourceDto);
    return this.toResponseDto(careerResource);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.careerResourcesService.remove(+id);
  }
}