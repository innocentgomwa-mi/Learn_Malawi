import { Injectable } from '@nestjs/common';
import { AnnouncementsService } from '../announcements/announcements.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { SearchLogService } from '../search-log/search-log.service';

export interface AdminNotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'announcement' | 'insight' | 'audit' | 'user';
  level: 'high' | 'normal';
  targetSection: string;
  actionLabel: string;
  count: number;
}

@Injectable()
export class AdminNotificationsService {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly searchLogService: SearchLogService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async getNotifications(): Promise<AdminNotificationItem[]> {
    const [unpublishedAnnouncements, publishedAnnouncements, searchLogs, activityLogs] = await Promise.all([
      this.announcementsService.findAll(undefined, false),
      this.announcementsService.findAll(undefined, true),
      this.searchLogService.findAll(50),
      this.activityLogService.findAll(50),
    ]);

    const criticalDraftCount = Array.isArray(unpublishedAnnouncements) ? unpublishedAnnouncements.length : 0;
    const urgentPublishedCount = Array.isArray(publishedAnnouncements)
      ? publishedAnnouncements.filter((announcement) => announcement.priority === 'high').length
      : 0;
    const zeroResultSearchCount = Array.isArray(searchLogs)
      ? searchLogs.filter((log) => Number(log.results_count) === 0).length
      : 0;
    const recentActionCounts = Array.isArray(activityLogs)
      ? activityLogs.reduce(
          (acc, item) => {
            if (item.action === 'post_rejected') acc.rejected += 1;
            if (item.action === 'teacher_registered') acc.teacherRegistrations += 1;
            if (item.action === 'student_registered') acc.studentRegistrations += 1;
            return acc;
          },
          { rejected: 0, teacherRegistrations: 0, studentRegistrations: 0 },
        )
      : { rejected: 0, teacherRegistrations: 0, studentRegistrations: 0 };

    const notifications: AdminNotificationItem[] = [];

    if (criticalDraftCount > 0) {
      notifications.push({
        id: 'unpublished-announcements',
        title: `${criticalDraftCount} pending announcement draft${criticalDraftCount === 1 ? '' : 's'}`,
        description: 'Review and publish announcements before they become stale.',
        type: 'announcement',
        level: 'high',
        targetSection: 'announcements',
        actionLabel: 'Review drafts',
        count: criticalDraftCount,
      });
    }

    if (urgentPublishedCount > 0) {
      notifications.push({
        id: 'urgent-announcements',
        title: `${urgentPublishedCount} high-priority announcement${urgentPublishedCount === 1 ? '' : 's'}`,
        description: 'Important announcements are live and need monitoring.',
        type: 'announcement',
        level: 'high',
        targetSection: 'announcements',
        actionLabel: 'View urgent announcements',
        count: urgentPublishedCount,
      });
    }

    if (zeroResultSearchCount > 5) {
      notifications.push({
        id: 'search-zero-results',
        title: `${zeroResultSearchCount} recent searches returned no results`,
        description: 'Investigate search queries and improve resource coverage.',
        type: 'insight',
        level: 'normal',
        targetSection: 'search-analytics',
        actionLabel: 'Inspect search analytics',
        count: zeroResultSearchCount,
      });
    }

    if (recentActionCounts.rejected > 0) {
      notifications.push({
        id: 'recent-post-rejections',
        title: `${recentActionCounts.rejected} recently rejected teacher post${recentActionCounts.rejected === 1 ? '' : 's'}`,
        description: 'Check rejected content and verify the moderation workflow.',
        type: 'audit',
        level: 'normal',
        targetSection: 'logs',
        actionLabel: 'Review moderation logs',
        count: recentActionCounts.rejected,
      });
    }

    if (recentActionCounts.teacherRegistrations > 0 || recentActionCounts.studentRegistrations > 0) {
      const totalRegistrations = recentActionCounts.teacherRegistrations + recentActionCounts.studentRegistrations;
      notifications.push({
        id: 'new-registrations',
        title: `${totalRegistrations} new account registration${totalRegistrations === 1 ? '' : 's'}`,
        description: 'New users have joined the system and may require approval or onboarding.',
        type: 'user',
        level: 'normal',
        targetSection: 'students',
        actionLabel: 'View users',
        count: totalRegistrations,
      });
    }

    return notifications;
  }
}
