import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminNotificationsService, AdminNotificationItem } from './admin-notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminNotificationsController {
  constructor(private readonly adminNotificationsService: AdminNotificationsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async listNotifications(): Promise<AdminNotificationItem[]> {
    return this.adminNotificationsService.getNotifications();
  }
}
