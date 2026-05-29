import { Search, Bell, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useRefreshRate } from '@/lib/RefreshRateContext';
import { fetchAnnouncements, fetchDiscussions, fetchChatMessages } from '@/api';
import { getSeenNotificationIds, markNotificationsAsRead, getLastSeenChatMessageDate, getSeenDiscussionIds } from '@/lib/notificationStorage';
import { isAnnouncementForRole } from '@/lib/notificationFilters';

const PAGE_TITLES = {
  '/teacher': 'Dashboard',
  '/teacher/courses': 'Courses',
  '/teacher/study-notes': 'Study Materials',
  '/teacher/past-papers': 'Past Papers',
  '/teacher/tutorials': 'Tutorials',
  '/teacher/assignments': 'Assignments',
  '/teacher/quizzes': 'Quizzes',
  '/teacher/students': 'Students',
  '/teacher/attendance': 'Attendance',
  '/teacher/learning-paths': 'Learning Paths',
  '/teacher/analytics': 'Analytics & Reports',
  '/teacher/discussions': 'Discussions',
  '/teacher/announcements': 'Announcements',
  '/teacher/settings': 'Settings',
};

export default function TeacherTopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshSeconds } = useRefreshRate();
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [unreadDiscussionCount, setUnreadDiscussionCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const title = PAGE_TITLES[/** @type {keyof typeof PAGE_TITLES} */ (location.pathname)] || 'Teacher Portal';

  useEffect(() => {
    if (!user?.email) {
      setUnreadAnnouncements(0);
      return;
    }

    const countAndMarkRead = async () => {
      const response = await fetchAnnouncements({ published: true });
      const data = Array.isArray(response) ? response : [];
      const filtered = data.filter((announcement) =>
        isAnnouncementForRole(announcement, user.role, user.email),
      );
      const seenIds = getSeenNotificationIds(user.email, user.role);
      const unread = filtered.filter((announcement) => announcement?.id && !seenIds.includes(String(announcement.id))).length;
      setUnreadAnnouncements(unread);
    };

    if (location.pathname === '/teacher/announcements') {
      setUnreadAnnouncements(0);
      fetchAnnouncements({ published: true })
        .then((response) => {
          const data = Array.isArray(response) ? response : [];
          const announcementIds = data
            .filter((announcement) => isAnnouncementForRole(announcement, user.role, user.email))
            .filter((announcement) => announcement?.id)
            .map((announcement) => announcement.id);
          if (announcementIds.length > 0) {
            markNotificationsAsRead(user.email, announcementIds, user.role);
          }
        })
        .catch(() => {});
      return;
    }

    let mounted = true;
    countAndMarkRead().catch(() => {
      if (mounted) setUnreadAnnouncements(0);
    });

    return () => {
      mounted = false;
    };
  }, [user?.email, location.pathname]);

  useEffect(() => {
    if (!user?.email) {
      setUnreadChatCount(0);
      return;
    }

    if (location.pathname === '/teacher/collaboration') {
      setUnreadChatCount(0);
      return;
    }

    let active = true;
    const loadChatCount = async () => {
      try {
        const response = await fetchChatMessages({ room: 'general', notificationFeed: true });
        if (!active) return;
        const messages = Array.isArray(response) ? response : [];
        const lastSeen = getLastSeenChatMessageDate(user.email, 'general', user.role);
        const unread = messages.filter((message) => {
          if (message.sender_email === user.email) return false;
          const createdAt = new Date(message.created_date || message.createdAt || message.created_at);
          if (Number.isNaN(createdAt.getTime())) return false;
          return !lastSeen || createdAt > lastSeen;
        }).length;
        setUnreadChatCount(unread);
      } catch {
        if (active) {
          setUnreadChatCount(0);
        }
      }
    };

    loadChatCount();
    if (refreshSeconds) {
      const intervalId = setInterval(loadChatCount, refreshSeconds * 1000);
      return () => clearInterval(intervalId);
    }
    return () => {
      active = false;
    };
  }, [refreshSeconds, user?.email, location.pathname]);

  useEffect(() => {
    if (!user?.email) {
      setUnreadDiscussionCount(0);
      return;
    }

    let mounted = true;
    const loadDiscussionCount = async () => {
      try {
        const response = await fetchDiscussions({ teacherEmail: user.email });
        if (!mounted) return;
        const threads = Array.isArray(response) ? response : [];
        if (location.pathname === '/teacher/discussions') {
          setUnreadDiscussionCount(0);
          return;
        }

        const seenIds = getSeenDiscussionIds(user.email, user.role);
        const unread = threads.filter((thread) => thread?.id && !seenIds.includes(String(thread.id))).length;
        setUnreadDiscussionCount(unread);
      } catch {
        if (mounted) setUnreadDiscussionCount(0);
      }
    };

    loadDiscussionCount();
    if (refreshSeconds) {
      const intervalId = setInterval(loadDiscussionCount, refreshSeconds * 1000);
      return () => clearInterval(intervalId);
    }

    return () => {
      mounted = false;
    };
  }, [refreshSeconds, user?.email, location.pathname]);

  return (
    <header className="h-20 bg-white border-b border-blue-100 flex items-center gap-4 px-6 shrink-0">
      {/* Page title */}
      <h1 className="text-base font-semibold text-slate-800 mr-4 hidden sm:block">{title}</h1>

      {/* Search */}
      <div className="hidden sm:block sm:flex-1 sm:max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/teacher/notifications')}
          aria-label="Open notifications"
          className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadAnnouncements + unreadChatCount + unreadDiscussionCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-5 rounded-full bg-red-500 text-[10px] text-white font-semibold flex items-center justify-center px-1.5">
              {unreadAnnouncements + unreadChatCount + unreadDiscussionCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </button>

        {/* Avatar */}
        <button
          type="button"
          onClick={() => navigate('/teacher/settings?tab=profile')}
          className="flex items-center gap-2.5 ml-2 pl-3 border-l border-slate-200 rounded-xl hover:bg-slate-50 pr-2 py-1 transition-colors"
          aria-label="Open profile settings"
          title="Profile settings"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center text-white text-sm font-bold">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || '?'
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.full_name || '...'}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role || 'Teacher'}</p>
          </div>
        </button>
      </div>
    </header>
  );
}