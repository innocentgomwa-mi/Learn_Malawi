import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { StudyBlocksController } from './study-blocks.controller';
import { ResourcesController } from './resources.controller';
import { ExamsController } from './exams.controller';
import { ClassSchedulesController } from './class-schedules.controller';
import { StudyBlock } from './entities/study-block.entity';
import { Resource } from './entities/resource.entity';
import { Exam } from './entities/exam.entity';
import { ClassSchedule } from './entities/class-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyBlock, Resource, Exam, ClassSchedule])],
  controllers: [StudyBlocksController, ResourcesController, ExamsController, ClassSchedulesController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
