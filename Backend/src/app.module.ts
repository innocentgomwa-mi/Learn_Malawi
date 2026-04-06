import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuardWithPublic } from './auth/guards/public.guard';
import { User } from './users/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { CareerResource } from './career-resources/entities/career-resource.entity';
import { Quiz } from './quizzes/entities/quiz.entity';
import { Question } from './quizzes/entities/question.entity';
import { Tutorial } from './tutorials/entities/tutorial.entity';
import { PastPaper } from './past-papers/entities/past-paper.entity';
import { StudyNote } from './study-notes/entities/study-note.entity';
import { Attendance } from './attendance/entities/attendance.entity';
import * as Joi from 'joi';
import { CareerResourcesModule } from './career-resources/career-resources.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { TutorialsModule } from './tutorials/tutorials.module';
import { PastPapersModule } from './past-papers/past-papers.module';
import { StudyNotesModule } from './study-notes/study-notes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { Announcement } from './announcements/entities/announcement.entity';
import { Discussion } from './discussions/entities/discussion.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: configService.get<string>('NODE_ENV') === 'production',
        entities: [
          User,
          RefreshToken,
          CareerResource,
          Quiz,
          Question,
          Tutorial,
          PastPaper,
          StudyNote,
          Attendance,
          Announcement,
          Discussion,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PastPapersModule,
    CareerResourcesModule,
    QuizzesModule,
    TutorialsModule,
    StudyNotesModule,
    AttendanceModule,
    AnnouncementsModule,
    DiscussionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuardWithPublic,
    },
  ],
})
export class AppModule {}