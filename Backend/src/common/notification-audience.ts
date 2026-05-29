import { UserRole } from '../users/entities/user.entity';

export type NormalizedNotificationRole = 'student' | 'teacher' | 'admin';

export function normalizeNotificationRole(role?: string): NormalizedNotificationRole {
  const value = String(role || '').toLowerCase();
  if (value.includes('admin')) return 'admin';
  if (value.includes('teacher')) return 'teacher';
  return 'student';
}

export function isAnnouncementVisibleToRole(
  targetAudience: string | undefined,
  viewerRole?: string,
  viewerEmail?: string,
  announcementTeacherEmail?: string,
): boolean {
  const audience = String(targetAudience || 'all').toLowerCase();
  const role = normalizeNotificationRole(viewerRole);

  if (role === 'admin') {
    return audience === 'all' || audience === 'admins';
  }

  if (role === 'teacher') {
    if (audience === 'all' || audience === 'teachers') {
      return true;
    }
    if (viewerEmail && announcementTeacherEmail) {
      return viewerEmail.toLowerCase() === announcementTeacherEmail.toLowerCase();
    }
    return false;
  }

  return audience === 'all' || audience === 'students';
}

export function isChatMessageVisibleAsNotification(
  senderEmail: string | undefined,
  viewerEmail: string | undefined,
  viewerRole: string | undefined,
  teacherEmails: Set<string>,
): boolean {
  const role = normalizeNotificationRole(viewerRole);
  const sender = String(senderEmail || '').toLowerCase();
  const viewer = String(viewerEmail || '').toLowerCase();

  if (!sender || !viewer || sender === viewer) {
    return false;
  }

  if (role === 'admin') {
    return false;
  }

  return !teacherEmails.has(sender);
}

export function roleUsesPersonalScheduleNotifications(role?: string): boolean {
  const normalized = normalizeNotificationRole(role);
  return normalized === 'student' || normalized === 'teacher';
}

export function roleUsesGeneralChatNotifications(role?: string): boolean {
  return normalizeNotificationRole(role) !== 'admin';
}

export function mapUserRoleToEnum(role?: string): UserRole | undefined {
  const normalized = normalizeNotificationRole(role);
  if (normalized === 'admin') return UserRole.ADMIN;
  if (normalized === 'teacher') return UserRole.TEACHER;
  if (normalized === 'student') return UserRole.STUDENT;
  return undefined;
}
