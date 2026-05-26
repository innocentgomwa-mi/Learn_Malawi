import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(@Body() createQuizDto: CreateQuizDto, @Req() req: any) {
    const teacherEmail = req.user?.email;
    return await this.quizzesService.create(createQuizDto, teacherEmail);
  }

  @Get()
  @Public()
  async findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('difficulty') difficulty?: string,
    @Query('class') classFilter?: string,
    @Query('teacher_email') teacherEmail?: string,
  ) {
    return await this.quizzesService.findAll(level, subject, difficulty, classFilter, teacherEmail);
  }

  @Get('levels')
  @Public()
  async getLevels() {
    return await this.quizzesService.getLevels();
  }

  @Get('subjects')
  @Public()
  async getSubjects() {
    return await this.quizzesService.getSubjects();
  }

  @Get('classes')
  @Public()
  async getClasses() {
    return await this.quizzesService.getClasses();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.quizzesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return await this.quizzesService.update(+id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async remove(@Param('id') id: string) {
    return await this.quizzesService.remove(+id);
  }
}
