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
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('learning-paths')
@UseInterceptors(ClassSerializerInterceptor)
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(@User() user: any, @Body() createLearningPathDto: CreateLearningPathDto) {
    return this.learningPathsService.create({
      ...createLearningPathDto,
      teacherEmail: user?.email,
    });
  }

  @Get()
  async findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('teacher_email') teacherEmail?: string,
    @Query('search') search?: string,
  ) {
    return this.learningPathsService.findAll(level, subject, teacherEmail, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.learningPathsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(@Param('id') id: string, @Body() updateLearningPathDto: UpdateLearningPathDto) {
    return this.learningPathsService.update(id, updateLearningPathDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.learningPathsService.remove(id);
  }
}
