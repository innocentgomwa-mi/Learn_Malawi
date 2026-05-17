import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { SearchLogModule } from '../search-log/search-log.module';
import { AdminNotificationsController } from './admin-notifications.controller';
import { AdminNotificationsService } from './admin-notifications.service';

@Module({
  imports: [AuthModule, AnnouncementsModule, ActivityLogModule, SearchLogModule],
  controllers: [AdminNotificationsController],
  providers: [AdminNotificationsService],
})
export class AdminNotificationsModule {}
