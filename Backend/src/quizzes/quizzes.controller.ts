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
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Controller('quizzes')
@UseInterceptors(ClassSerializerInterceptor)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  private toResponseDto(quiz: any): QuizResponseDto {
    return plainToInstance(QuizResponseDto, quiz, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(
    @User() user: any,
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<QuizResponseDto> {
    const payload = {
      ...createQuizDto,
      teacherEmail: user?.email,
    };
    const quiz = await this.quizzesService.create(payload as any);
    return this.toResponseDto(quiz);
  }

  @Get()
  @Public()
  async findAll(
    @Query('level') level?: string,
    @Query('subject') subject?: string,
    @Query('difficulty') difficulty?: string,
    @Query('class') classFilter?: string,
    @Query('teacher_email') teacherEmail?: string,
    @Query('search') search?: string,
  ): Promise<QuizResponseDto[]> {
    // Validate difficulty parameter if provided
    if (difficulty && difficulty !== 'all' && 
        difficulty !== 'easy' && difficulty !== 'medium' && difficulty !== 'hard') {
      throw new BadRequestException('Difficulty must be either "easy", "medium", "hard", or "all"');
    }

    const quizzes = await this.quizzesService.findAll(
      level,
      subject,
      difficulty,
      classFilter,
      teacherEmail,
      search,
    );
    return quizzes.map(quiz => this.toResponseDto(quiz));
  }

  @Get('levels')
  @Public()
  async getLevels(): Promise<{ levels: string[] }> {
    const levels = await this.quizzesService.getLevels();
    return { levels };
  }

  @Get('subjects')
  @Public()
  async getSubjects(@Query('level') level?: string): Promise<{ subjects: string[] }> {
    // Validate level parameter if provided
    if (level && level !== 'all' && level !== 'primary' && level !== 'secondary') {
      throw new BadRequestException('Level must be either "primary", "secondary", or "all"');
    }

    const subjects = await this.quizzesService.getSubjects(level);
    return { subjects };
  }

  @Get('classes')
  @Public()
  async getClasses(@Query('level') level?: string): Promise<{ classes: string[] }> {
    // Validate level parameter if provided
    if (level && level !== 'all' && level !== 'primary' && level !== 'secondary') {
      throw new BadRequestException('Level must be either "primary", "secondary", or "all"');
    }

    const classes = await this.quizzesService.getClasses(level);
    return { classes };
  }

  @Get('count')
  @Public()
  async count(): Promise<{ count: number }> {
    const count = await this.quizzesService.countAll();
    return { count };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<QuizResponseDto> {
    const quiz = await this.quizzesService.findOne(id);
    return this.toResponseDto(quiz);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<QuizResponseDto> {
    const quiz = await this.quizzesService.update(id, updateQuizDto);
    return this.toResponseDto(quiz);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.quizzesService.remove(id);
  }

  // Question-specific endpoints
  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async addQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<any> {
    const question = await this.quizzesService.addQuestion(id, createQuestionDto);
    return question;
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<any> {
    // Validate that questionId is a number
    if (isNaN(+questionId)) {
      throw new BadRequestException('Question ID must be a number');
    }

    const question = await this.quizzesService.updateQuestion(+questionId, updateQuestionDto);
    return question;
  }

  @Delete('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeQuestion(@Param('questionId') questionId: string): Promise<void> {
    // Validate that questionId is a number
    if (isNaN(+questionId)) {
      throw new BadRequestException('Question ID must be a number');
    }

    await this.quizzesService.removeQuestion(+questionId);
  }
}