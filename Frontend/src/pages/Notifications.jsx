import { useEffect, useState, useMemo } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Bell, Calendar, Megaphone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRefreshRate } from '@/lib/RefreshRateContext';
import { fetchAnnouncements, fetchChatMessages, fetchDiscussions, fetchClassSchedules } from '@/api';
import { markNotificationsAsRead, getLastSeenChatMessageDate, markChatMessagesAsSeen, markDiscussionThreadsAsRead } from '@/lib/notificationStorage';

function parseMessageDate(message) {
  const createdAt = new Date(message.created_date || message.createdAt || message.created_at);
  return Number.isNaN(createdAt.getTime()) ? null : createdAt;
}

function getUnreadChatMessages(messages, userEmail) {
  const lastSeen = getLastSeenChatMessageDate(userEmail, 'general');
  return Array.isArray(messages)
    ? messages
        .filter((message) => {
          if (message.sender_email === userEmail) return false;
          const createdAt = parseMessageDate(message);
          return createdAt && (!lastSeen || createdAt > lastSeen);
        })
        .sort((a, b) => parseMessageDate(b) - parseMessageDate(a))
    : [];
}

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role?.toLowerCase();
  const { refreshSeconds } = useRefreshRate();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [discussionThreads, setDiscussionThreads] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [announcementsResponse, chatResponse, discussionsResponse, scheduleResponse] = await Promise.all([
          fetchAnnouncements({ published: true }),
          fetchChatMessages({ room: 'general' }),
          role === 'teacher' ? fetchDiscussions({ teacherEmail: user?.email }) : Promise.resolve([]),
          role === 'teacher' ? fetchClassSchedules() : Promise.resolve([]),
        ]);

        if (!active) return;

        setAnnouncements(Array.isArray(announcementsResponse) ? announcementsResponse : []);
        setChatMessages(Array.isArray(chatResponse) ? chatResponse : []);
        setDiscussionThreads(Array.isArray(discussionsResponse) ? discussionsResponse : []);
        setSchedules(Array.isArray(scheduleResponse) ? scheduleResponse : []);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError.message ?? 'Unable to load notifications.');
      } finally {
        if (active) {
          setLoading(false);
          setLastRefreshed(new Date());
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!refreshSeconds || !isAuthenticated) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const [announcementsResponse, chatResponse, discussionsResponse, scheduleResponse] = await Promise.all([
          fetchAnnouncements({ published: true }),
          fetchChatMessages({ room: 'general' }),
          role === 'teacher' ? fetchDiscussions({ teacherEmail: user?.email }) : Promise.resolve([]),
          role === 'teacher' ? fetchClassSchedules() : Promise.resolve([]),
        ]);

        setAnnouncements(Array.isArray(announcementsResponse) ? announcementsResponse : []);
        setChatMessages(Array.isArray(chatResponse) ? chatResponse : []);
        setDiscussionThreads(Array.isArray(discussionsResponse) ? discussionsResponse : []);
        setSchedules(Array.isArray(scheduleResponse) ? scheduleResponse : []);
        setLastRefreshed(new Date());
      } catch (error) {
        // keep existing notifications if refresh fails
      }
    }, refreshSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [refreshSeconds, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();

    if (role === 'teacher') {
      return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user?.email;
    }

    if (role === 'student') {
      return audience === 'all' || audience === 'students';
    }

    return audience === 'all';
  });

  const unreadChatMessages = useMemo(() => getUnreadChatMessages(chatMessages, user?.email), [chatMessages, user?.email]);
  const isTeacherPage = location.pathname.startsWith('/teacher');
  const pageTitle = isTeacherPage ? 'Teacher notifications' : 'Notifications';
  const pageSubtitle = isTeacherPage
    ? 'Unified teacher alerts from announcements, discussions, and collaboration chat.'
    : 'Unified alerts from announcements and collaboration chat, with direct links to the related page.';

  const discussionItems = useMemo(() => {
    if (role !== 'teacher') return [];
    const threads = Array.isArray(discussionThreads) ? discussionThreads : [];
    return threads.map((thread) => ({
      id: `discussion-${thread.id}`,
      type: 'discussion',
      title: thread.title || 'New discussion thread',
      subtitle: thread.comments && thread.comments.length > 0 ? `Latest from ${thread.comments[thread.comments.length - 1].author}` : 'Discussion thread',
      body: thread.body || 'Open the discussion to continue.',
      createdAt: new Date(thread.createdAt || thread.created_at || Date.now()),
      path: '/teacher/discussions',
      audience: 'Discussion',
    }));
  }, [discussionThreads, role]);

  const scheduledReminderItems = useMemo(() => {
    if (role !== 'teacher') return [];
    const now = new Date();
    const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

    return (Array.isArray(schedules) ? schedules : [])
      .filter((session) => session.reminder_minutes > 0)
      .map((session) => {
        const sessionDayIdx = dayMap[session.day_of_week] ?? -1;
        let daysUntil = sessionDayIdx - now.getDay();
        if (daysUntil < 0) daysUntil += 7;
        const [hours, minutes] = (session.start_time || '00:00').split(':').map(Number);
        const sessionDate = new Date(now);
        sessionDate.setDate(now.getDate() + daysUntil);
        sessionDate.setHours(hours, minutes, 0, 0);
        const reminderTime = new Date(sessionDate.getTime() - (session.reminder_minutes || 0) * 60000);
        const msUntilReminder = reminderTime.getTime() - now.getTime();
        return { session, sessionDate, reminderTime, msUntilReminder, daysUntil };
      })
      .filter((reminder) => reminder.msUntilReminder > 0)
      .sort((a, b) => a.msUntilReminder - b.msUntilReminder)
      .slice(0, 4)
      .map((reminder) => {
        const label = reminder.daysUntil === 0 ? 'Today' : reminder.daysUntil === 1 ? 'Tomorrow' : reminder.session.day_of_week;
        return {
          id: `schedule-reminder-${reminder.session.id}`,
          type: 'schedule',
          title: `Upcoming class reminder: ${reminder.session.title}`,
          subtitle: `${label} at ${reminder.session.start_time}`,
          body: `Your ${reminder.session.subject || reminder.session.title} class for ${reminder.session.class_level || 'your students'} starts soon.`,
          createdAt: reminder.reminderTime,
          path: '/teacher/schedule',
          audience: 'Schedule',
          session: reminder.session,
        };
      });
  }, [role, schedules]);

  const notificationItems = useMemo(() => {
    const chatItem = unreadChatMessages.length > 0 ? [{
      id: 'chat-notification',
      type: 'chat',
      title: `${unreadChatMessages.length} new teacher chat ${unreadChatMessages.length === 1 ? 'message' : 'messages'}`,
      subtitle: `Latest from ${unreadChatMessages[0].sender_name || unreadChatMessages[0].sender_email}`,
      body: unreadChatMessages[0].message || 'Open the collaboration chat to reply.',
      createdAt: parseMessageDate(unreadChatMessages[0]) || new Date(),
      path: '/teacher/collaboration',
    }] : [];

    const announcementItems = filteredAnnouncements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      type: 'announcement',
      title: announcement.title || 'New announcement',
      subtitle: announcement.teacherEmail || 'Administration',
      body: announcement.body || announcement.message || 'No description available.',
      createdAt: new Date(announcement.createdAt || announcement.created_at || Date.now()),
      path: announcement.link || (role === 'teacher' ? '/teacher/announcements' : '/notifications'),
      audience: ((announcement.targetAudience || announcement.target_audience) || 'all').toString(),
      announcement,
    }));

    return [...chatItem, ...announcementItems, ...discussionItems, ...scheduledReminderItems].sort((a, b) => b.createdAt - a.createdAt);
  }, [filteredAnnouncements, role, unreadChatMessages, discussionItems, scheduledReminderItems]);

  const handleNotificationOpen = (item) => {
    if (!user?.email) return;

    if (item.type === 'announcement' && item.announcement?.id) {
      markNotificationsAsRead(user.email, [item.announcement.id]);
      return;
    }

    if (item.type === 'discussion') {
      const discussionId = item.id?.toString().replace('discussion-', '');
      if (discussionId) {
        markDiscussionThreadsAsRead(user.email, [discussionId]);
      }
      return;
    }

    if (item.type === 'chat') {
      const latestUnread = unreadChatMessages[0];
      const latestDate = latestUnread ? parseMessageDate(latestUnread) : null;
      if (latestDate) {
        markChatMessagesAsSeen(user.email, 'general', latestDate);
      }
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className={`rounded-3xl p-6 mb-8 shadow-lg ${isTeacherPage ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white' : 'bg-primary/10 text-primary'} `}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-sm">
              <Bell className="h-4 w-4" /> {pageTitle}
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight">{pageTitle}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 opacity-90">{pageSubtitle}</p>
            {lastRefreshed && (
              <p className="mt-4 text-xs opacity-80">
                Last refreshed at {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            )}
          </div>
          <Link
            to={isTeacherPage ? '/teacher' : '/'}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${isTeacherPage ? 'bg-white text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-100' : 'border border-border bg-card text-foreground hover:border-primary hover:text-primary'}`}
          >
            <Calendar className="h-4 w-4" /> {isTeacherPage ? 'Back to teacher dashboard' : 'Back to home'}
          </Link>
        </div>

        {isTeacherPage && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-white/80">Total alerts</p>
              <p className="mt-3 text-3xl font-bold">{notificationItems.length}</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-white/80">Announcements</p>
              <p className="mt-3 text-3xl font-bold">{notificationItems.filter((item) => item.type === 'announcement').length}</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-white/80">Chat updates</p>
              <p className="mt-3 text-3xl font-bold">{notificationItems.filter((item) => item.type === 'chat').length}</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-white/80">Discussion threads</p>
              <p className="mt-3 text-3xl font-bold">{notificationItems.filter((item) => item.type === 'discussion').length}</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-white/80">Schedule reminders</p>
              <p className="mt-3 text-3xl font-bold">{notificationItems.filter((item) => item.type === 'schedule').length}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading notifications…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          {error}
        </div>
      ) : notificationItems.length === 0 ? (
        <div className={`rounded-3xl border p-10 text-center text-sm transition ${isTeacherPage ? 'border-blue-100 bg-blue-50 text-slate-900' : 'border-border bg-card text-muted-foreground'}`}>
          <Megaphone className={`mx-auto mb-3 h-10 w-10 ${isTeacherPage ? 'text-blue-600' : 'text-primary'}`} />
          <p className="font-medium text-foreground">No notifications right now.</p>
          <p className="mt-2">Check back later for announcements and collaboration updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notificationItems.map((item) => (
            <article key={item.id} className={`rounded-3xl border p-6 shadow-sm transition ${isTeacherPage ? 'border-blue-100 bg-white hover:shadow-lg' : 'border-border bg-card'}`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold mb-2 text-slate-900">
                      {item.type === 'chat' ? (
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      ) : item.type === 'discussion' ? (
                        <Megaphone className="w-4 h-4 text-amber-600" />
                      ) : item.type === 'schedule' ? (
                        <Calendar className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Bell className="w-4 h-4 text-blue-600" />
                      )}
                      <span>
                        {item.type === 'chat'
                          ? 'Teacher Chat'
                          : item.type === 'discussion'
                          ? 'Discussion'
                          : item.type === 'schedule'
                          ? 'Schedule Reminder'
                          : 'Announcement'}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 truncate">{item.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {item.subtitle} · {item.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={item.path}
                    onClick={() => handleNotificationOpen(item)}
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    {item.type === 'chat'
                      ? 'Open collaboration'
                      : item.type === 'discussion'
                      ? 'Open discussion'
                      : item.type === 'schedule'
                      ? 'Open schedule'
                      : 'Open announcement'}
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                    {item.type === 'chat' ? 'Chat' : item.audience || 'All'}
                  </span>
                </div>
                <p className="text-sm leading-7 text-slate-700">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
