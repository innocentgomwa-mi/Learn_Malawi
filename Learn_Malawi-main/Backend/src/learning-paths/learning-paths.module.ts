import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPath } from './entities/learning-path.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningPath])],
  controllers: [LearningPathsController],
  providers: [LearningPathsService],
  exports: [LearningPathsService],
})
export class LearningPathsModule {}
