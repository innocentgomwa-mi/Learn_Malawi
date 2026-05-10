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
import { AttendanceRecord } from './attendance/entities/attendance-record.entity';
import * as Joi from 'joi';
import { CareerResourcesModule } from './career-resources/career-resources.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { TutorialsModule } from './tutorials/tutorials.module';
import { PastPapersModule } from './past-papers/past-papers.module';
import { StudyNotesModule } from './study-notes/study-notes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { AiModule } from './ai/ai.module';
import { TeacherPostsModule } from './teacher-posts/teacher-posts.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { DataChangeHistoryModule } from './data-change-history/data-change-history.module';
import { StudentProgressModule } from './student-progress/student-progress.module';
import { InsightsModule } from './insights/insights.module';
import { ResourceRatingsModule } from './resource-ratings/resource-ratings.module';
import { Announcement } from './announcements/entities/announcement.entity';
import { Discussion } from './discussions/entities/discussion.entity';
import { TeacherPost } from './teacher-posts/entities/teacher-post.entity';
import { SystemSetting } from './system-settings/entities/system-setting.entity';
import { ActivityLog } from './activity-log/entities/activity-log.entity';
import { DataChangeHistory } from './data-change-history/entities/data-change-history.entity';
import { StudentProgress } from './student-progress/entities/student-progress.entity';
import { ResourceRating } from './resource-ratings/entities/resource-rating.entity';
import { StudyGroupsModule } from './study-groups/study-groups.module';
import { StudyGroup } from './study-groups/entities/study-group.entity';
import { StudyGroupMessage } from './study-groups/entities/study-group-message.entity';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { LearningPath } from './learning-paths/entities/learning-path.entity';
import { ScheduleModule } from './schedule/schedule.module';
import { StudyBlock } from './schedule/entities/study-block.entity';
import { Resource } from './schedule/entities/resource.entity';
import { Exam } from './schedule/entities/exam.entity';

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
        HF_API_KEY: Joi.string().required(),
        HF_MODEL: Joi.string().default('google/flan-t5-small'),
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
          AttendanceRecord,
          Announcement,
          Discussion,
          TeacherPost,
          SystemSetting,
          ActivityLog,
          DataChangeHistory,
          StudentProgress,
          ResourceRating,
          LearningPath,
          StudyGroup,
          StudyGroupMessage,
          StudyBlock,
          Resource,
          Exam,
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
    AiModule,
    TeacherPostsModule,
    SystemSettingsModule,
    ActivityLogModule,
    DataChangeHistoryModule,
    StudentProgressModule,
    InsightsModule,
    ResourceRatingsModule,
    StudyGroupsModule,
    LearningPathsModule,
    ScheduleModule,
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