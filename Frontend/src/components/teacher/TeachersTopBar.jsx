import { Search, Bell, Mail } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

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

  const title = PAGE_TITLES[/** @type {keyof typeof PAGE_TITLES} */ (location.pathname)] || 'Teacher Portal';

  return (
    <header className="h-16 bg-white border-b border-blue-100 flex items-center gap-4 px-6 shrink-0">
      {/* Page title */}
      <h1 className="text-base font-semibold text-slate-800 mr-4 hidden sm:block">{title}</h1>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors">
          <Mail className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
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