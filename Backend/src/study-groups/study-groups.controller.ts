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
  Req,
  ForbiddenException,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { StudyGroupsService } from './study-groups.service';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { UpdateStudyGroupDto } from './dto/update-study-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

const uploadDir = join(__dirname, '..', '..', 'uploads');
const studyGroupStorage = diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    callback(null, safeName);
  },
});

const studyGroupIconFilter = (_req, file, callback) => {
  const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (!allowedImageTypes.includes(file.mimetype)) {
    return callback(new BadRequestException('Only PNG, JPEG, WEBP, and GIF images are allowed for group icons.'), false);
  }
  callback(null, true);
};

@Controller('study-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'icon', maxCount: 1 }], {
      storage: studyGroupStorage,
      fileFilter: studyGroupIconFilter,
    }),
  )
  create(
    @Req() req: any,
    @UploadedFiles() files: { icon?: Express.Multer.File[] },
    @Body() createStudyGroupDto: CreateStudyGroupDto,
  ) {
    const payload = { ...createStudyGroupDto };
    if (files?.icon?.[0]) {
      payload.icon_url = `/uploads/${files.icon[0].filename}`;
    }
    return this.studyGroupsService.create(payload, req.user);
  }

  @Get()
  findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('mentor_email') mentorEmail?: string,
  ) {
    return this.studyGroupsService.findAll(level, subject, mentorEmail);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studyGroupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'icon', maxCount: 1 }], {
      storage: studyGroupStorage,
      fileFilter: studyGroupIconFilter,
    }),
  )
  update(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFiles() files: { icon?: Express.Multer.File[] },
    @Body() updateStudyGroupDto: UpdateStudyGroupDto,
  ) {
    const payload = { ...updateStudyGroupDto };
    if (files?.icon?.[0]) {
      payload.icon_url = `/uploads/${files.icon[0].filename}`;
    }
    return this.studyGroupsService.update(id, payload, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async remove(@Req() req: any, @Param('id') id: string) {
    const user = req?.user;
    if (!user) throw new ForbiddenException('Unauthorized');
    return this.studyGroupsService.remove(id, user);
  }

  @Delete(':id/members/:memberEmail')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async removeMember(
    @Req() req: any,
    @Param('id') id: string,
    @Param('memberEmail') memberEmail: string,
    @Query('ban') ban?: string,
  ) {
    const user = req?.user;
    if (!user) throw new ForbiddenException('Unauthorized');
    return this.studyGroupsService.removeMember(id, memberEmail, user, ban === 'true');
  }
}
