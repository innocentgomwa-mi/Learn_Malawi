import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { StudentProgressModule } from '../student-progress/student-progress.module';

@Module({
  imports: [ActivityLogModule, StudentProgressModule],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
