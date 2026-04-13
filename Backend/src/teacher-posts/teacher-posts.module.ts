import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherPostsController } from './teacher-posts.controller';
import { TeacherPostsService } from './teacher-posts.service';
import { TeacherPost } from './entities/teacher-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherPost])],
  controllers: [TeacherPostsController],
  providers: [TeacherPostsService],
  exports: [TeacherPostsService],
})
export class TeacherPostsModule {}
