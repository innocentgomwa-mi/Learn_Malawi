import { Search, Bell, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { fetchAnnouncements, fetchDiscussions } from '@/api';
import { getSeenNotificationIds, markNotificationsAsRead } from '@/lib/notificationStorage';

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
  '/teacher/analytics': 'Analytics & Reports',
  '/teacher/discussions': 'Discussions',
  '/teacher/announcements': 'Announcements',
  '/teacher/settings': 'Settings',
};

export default function TeacherTopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [discussionCount, setDiscussionCount] = useState(0);
  const title = PAGE_TITLES[/** @type {keyof typeof PAGE_TITLES} */ (location.pathname)] || 'Teacher Portal';

  useEffect(() => {
    if (!user?.email) {
      setUnreadNotifications(0);
      return;
    }

    const countAndMarkRead = async () => {
      const response = await fetchAnnouncements({ published: true });
      const data = Array.isArray(response) ? response : [];
      const filtered = data.filter((announcement) => {
        const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();
        return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user.email;
      });
      const seenIds = getSeenNotificationIds(user.email);
      const unread = filtered.filter((announcement) => announcement?.id && !seenIds.includes(String(announcement.id))).length;
      setUnreadNotifications(unread);
    };

    if (location.pathname === '/teacher/announcements') {
      setUnreadNotifications(0);
      fetchAnnouncements({ published: true })
        .then((response) => {
          const data = Array.isArray(response) ? response : [];
          const announcementIds = data
            .filter((announcement) => {
              const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();
              return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user.email;
            })
            .filter((announcement) => announcement?.id)
            .map((announcement) => announcement.id);
          if (announcementIds.length > 0) {
            markNotificationsAsRead(user.email, announcementIds);
          }
        })
        .catch(() => {});
      return;
    }

    let mounted = true;
    countAndMarkRead().catch(() => {
      if (mounted) setUnreadNotifications(0);
    });

    return () => {
      mounted = false;
    };
  }, [user?.email, location.pathname]);

  useEffect(() => {
    if (!user?.email) {
      setDiscussionCount(0);
      return;
    }

    let mounted = true;
    fetchDiscussions({ teacherEmail: user.email })
      .then((data) => {
        if (!mounted) return;
        setDiscussionCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {
        if (mounted) setDiscussionCount(0);
      });

    return () => {
      mounted = false;
    };
  }, [user?.email]);

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
          onClick={() => navigate('/teacher/discussions')}
          aria-label="Open teacher messages"
          className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors relative"
        >
          <Mail className="w-4 h-4" />
          {discussionCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-5 rounded-full bg-red-500 text-[10px] text-white font-semibold flex items-center justify-center px-1.5">
              {discussionCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/teacher/announcements')}
          aria-label="Open teacher announcements"
          className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-5 rounded-full bg-red-500 text-[10px] text-white font-semibold flex items-center justify-center px-1.5">
              {unreadNotifications}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 ml-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.full_name?.charAt(0) || '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.full_name || '...'}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role || 'Teacher'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}