import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, ClassSerializerInterceptor, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SharedResourcesService } from './shared-resources.service';
import { CreateSharedResourceDto } from './dto/create-shared-resource.dto';
import { UpdateSharedResourceDto } from './dto/update-shared-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { extname } from 'path';

const uploadDir = 'uploads';
const allowedFileTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Controller('shared-resources')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class SharedResourcesController {
  constructor(private readonly sharedResourcesService: SharedResourcesService) {}

  @Post()
  create(@User() user: any, @Body() createSharedResourceDto: CreateSharedResourceDto) {
    return this.sharedResourcesService.create(createSharedResourceDto, user?.email, user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('resource_type') resourceType?: string) {
    return this.sharedResourcesService.findAll(search, resourceType);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSharedResourceDto: UpdateSharedResourceDto, @User() user: any) {
    return this.sharedResourcesService.update(id, updateSharedResourceDto, user?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.sharedResourcesService.remove(id, user?.email);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, callback) => {
          const ext = extname(file.originalname) || '';
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          callback(null, name);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!allowedFileTypes.includes(file.mimetype)) {
          callback(new BadRequestException('Unsupported file type.'), false);
          return;
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    return {
      file_url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
    };
  }
}
