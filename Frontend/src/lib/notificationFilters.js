/**
 * @param {string | undefined} role
 * @returns {'student' | 'teacher' | 'admin'}
 */
export function normalizeNotificationRole(role) {
  const value = String(role || 'student').toLowerCase();
  if (value.includes('admin')) return 'admin';
  if (value.includes('teacher')) return 'teacher';
  return 'student';
}

/**
 * @param {Record<string, unknown>} announcement
 * @param {string | undefined} role
 * @param {string | undefined} userEmail
 */
export function isAnnouncementForRole(announcement, role, userEmail) {
  const audience = String(announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();
  const normalizedRole = normalizeNotificationRole(role);

  if (normalizedRole === 'admin') {
    return audience === 'all' || audience === 'admins';
  }

  if (normalizedRole === 'teacher') {
    if (audience === 'all' || audience === 'teachers') return true;
    const teacherEmail = String(announcement.teacherEmail || announcement.teacher_email || '').toLowerCase();
    return Boolean(userEmail && teacherEmail && teacherEmail === userEmail.toLowerCase());
  }

  return audience === 'all' || audience === 'students';
}

/**
 * @param {Record<string, unknown>} message
 * @param {string | undefined} role
 * @param {string | undefined} userEmail
 * @param {Set<string>} [teacherEmails]
 */
export function isChatMessageForRole(message, role, userEmail, teacherEmails = new Set()) {
  const normalizedRole = normalizeNotificationRole(role);
  const senderEmail = String(message.sender_email || message.senderEmail || '').toLowerCase();
  const viewerEmail = String(userEmail || '').toLowerCase();

  if (!senderEmail || !viewerEmail || senderEmail === viewerEmail) {
    return false;
  }

  if (normalizedRole === 'admin') {
    return false;
  }

  return !teacherEmails.has(senderEmail);
}

/**
 * @param {string | undefined} role
 */
export function roleUsesPersonalScheduleNotifications(role) {
  const normalizedRole = normalizeNotificationRole(role);
  return normalizedRole === 'student' || normalizedRole === 'teacher';
}

/**
 * @param {string | undefined} role
 */
export function roleUsesGeneralChatNotifications(role) {
  return normalizeNotificationRole(role) !== 'admin';
}

/** @param {Array<Record<string, unknown>>} teachers */
export function buildTeacherEmailSet(teachers) {
  return new Set(
    (Array.isArray(teachers) ? teachers : [])
      .map((teacher) => String(teacher.email || '').toLowerCase())
      .filter(Boolean),
  );
}

/** @param {string | number | null | undefined} dateStr */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Number(new Date(dateStr)) - Date.now();
  return Math.ceil(diff / 86400000);
}

/**
 * @param {string | undefined} dayOfWeek
 * @param {string | undefined} startTime
 */
function getNextOccurrence(dayOfWeek, startTime) {
  const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const targetDay = dayMap[String(dayOfWeek || '').toLowerCase()];
  if (targetDay === undefined || !startTime) return null;

  const now = new Date();
  const sessionDate = new Date(now);
  const daysAhead = (targetDay - now.getDay() + 7) % 7;
  sessionDate.setDate(now.getDate() + daysAhead);
  const [hour, minute] = String(startTime).split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  sessionDate.setHours(hour, minute, 0, 0);
  if (sessionDate.getTime() <= now.getTime()) {
    sessionDate.setDate(sessionDate.getDate() + 7);
  }
  return sessionDate;
}

/**
 * @param {Array<Record<string, unknown>>} adminNotifications
 */
export function mapAdminNotifications(adminNotifications) {
  return (Array.isArray(adminNotifications) ? adminNotifications : []).map((item) => ({
    id: `admin-${item.id}`,
    type: 'admin',
    title: item.title,
    subtitle: item.type ? String(item.type).replace(/_/g, ' ') : 'Admin alert',
    body: item.description || '',
    date: new Date().toISOString(),
    urgent: item.level === 'high',
    actionLabel: item.actionLabel,
    targetSection: item.targetSection,
  }));
}

/**
 * @param {{
 *   role?: string;
 *   userEmail?: string;
 *   exams?: Array<Record<string, unknown>>;
 *   resources?: Array<Record<string, unknown>>;
 *   studyBlocks?: Array<Record<string, unknown>>;
 *   chatMessages?: Array<Record<string, unknown>>;
 *   announcements?: Array<Record<string, unknown>>;
 *   adminNotifications?: Array<Record<string, unknown>>;
 *   classSchedules?: Array<Record<string, unknown>>;
 *   teacherEmails?: Set<string>;
 * }} sources
 */
export function buildNotificationsFromSources({
  role,
  userEmail,
  exams = [],
  resources = [],
  studyBlocks = [],
  chatMessages = [],
  announcements = [],
  adminNotifications = [],
  classSchedules = [],
  teacherEmails = new Set(),
}) {
  const normalizedRole = normalizeNotificationRole(role);
  const notifs = [];

  if (normalizedRole === 'admin') {
    notifs.push(...mapAdminNotifications(adminNotifications));
  }

  if (roleUsesPersonalScheduleNotifications(role)) {
    const now = Date.now();
    notifs.push(
      ...exams.map((exam) => {
        const days = daysUntil(exam.exam_date || exam.created_date || exam.createdAt || exam.updatedAt);
        const notifyDays = Array.isArray(exam.notify_days_before) && exam.notify_days_before.length
          ? exam.notify_days_before.map((value) => Number(value)).filter((value) => Number.isFinite(value))
          : [1, 7];
        const isReminderWindow = days !== null && days >= 0 && notifyDays.includes(days);
        const urgent = isReminderWindow || (days !== null && days <= 1 && days >= 0);
        return {
          id: `exam-${exam.id}`,
          type: 'exam',
          title: isReminderWindow ? `Exam reminder: ${exam.title}` : `Upcoming exam: ${exam.title}`,
          subtitle: exam.subject,
          body: `${exam.subject} exam${exam.location ? ` at ${exam.location}` : ''}. ${days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : days !== null && days > 0 ? `In ${days} days.` : 'Check your schedule.'}`,
          date: exam.exam_date || exam.created_date || exam.createdAt || exam.updatedAt || '',
          urgent,
        };
      }),
      ...resources.map((resource) => ({
        id: `resource-${resource.id}`,
        type: 'resource',
        title: `New resource added: ${resource.name || resource.title || 'Resource'}`,
        subtitle: resource.subject || 'General',
        body: `A new ${String(resource.type || resource.resource_type || 'resource').replace(/_/g, ' ')} has been added${resource.subject ? ` for ${resource.subject}` : ''}. ${resource.url ? 'Click to open the resource.' : ''}`,
        date: resource.created_date || resource.createdAt || resource.updatedAt || '',
        url: resource.url,
        urgent: false,
      })),
      ...studyBlocks.map((block) => ({
        id: `study-${block.id}`,
        type: 'study',
        title: `Study block: ${block.title || block.name || 'Study session'}`,
        subtitle: block.subject || block.day_of_week,
        body: `Scheduled for ${block.day_of_week || 'a day'} from ${block.start_time || '?'} to ${block.end_time || '?'}${block.subject ? ` — ${block.subject}` : ''}.${block.notes ? ` Notes: ${block.notes}` : ''}`,
        date: block.created_date || block.createdAt || block.updatedAt || '',
        urgent: false,
      })),
      ...classSchedules
        .map((schedule) => {
          const reminderMinutes = Number(schedule.reminder_minutes || 0);
          if (!(reminderMinutes > 0)) return null;
          const nextOccurrence = getNextOccurrence(schedule.day_of_week, schedule.start_time);
          if (!nextOccurrence) return null;
          const reminderTime = nextOccurrence.getTime() - reminderMinutes * 60000;
          const msUntil = reminderTime - now;
          if (msUntil < -60000 || msUntil > 24 * 60 * 60 * 1000) return null;

          return {
            id: `class-reminder-${schedule.id}`,
            type: 'study',
            title: `Class reminder: ${schedule.title}`,
            subtitle: schedule.subject || schedule.day_of_week || 'Class schedule',
            body: `Your class starts at ${schedule.start_time || 'scheduled time'} on ${schedule.day_of_week || 'your selected day'}. Reminder set for ${reminderMinutes} minute(s) before class.`,
            date: new Date(reminderTime).toISOString(),
            urgent: true,
          };
        })
        .filter(Boolean),
    );
  }

  if (roleUsesGeneralChatNotifications(role)) {
    notifs.push(
      ...chatMessages
        .filter((message) => isChatMessageForRole(message, role, userEmail, teacherEmails))
        .map((message) => ({
          id: `message-${message.id}`,
          type: 'message',
          title: `New message from ${message.sender_name || message.sender_email || 'Someone'}`,
          subtitle: message.room || 'General chat',
          body: message.message || '',
          date: message.created_date || message.createdAt || message.created_at || '',
          urgent: false,
        })),
    );
  }

  notifs.push(
    ...announcements
      .filter((announcement) => isAnnouncementForRole(announcement, role, userEmail))
      .map((announcement) => ({
        id: `announcement-${announcement.id}`,
        type: 'announcement',
        title: announcement.title,
        subtitle:
          (announcement.targetAudience || announcement.target_audience) === 'students'
            ? 'From your teacher'
            : normalizedRole === 'admin'
              ? 'Admin notice'
              : 'Announcement',
        body: announcement.body || '',
        date: announcement.createdAt || announcement.created_at || '',
        urgent: (announcement.priority || 'normal') === 'high',
      })),
  );

  return notifs.sort((a, b) => Number(new Date(b.date || '')) - Number(new Date(a.date || '')));
}
