import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, HelpCircle, Users, BarChart2,
  MessageSquare, MessageCircle, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  GraduationCap, PlayCircle, CalendarCheck, TrendingUp, Briefcase, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

/** @type {Array<{ label: string; items: Array<{ path: string; icon: import('lucide-react').LucideIcon; label: string; exact?: boolean }> }>} */
const groups = [
  {
    label: 'Overview',
    items: [
      { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ]
  },
  {
    label: 'Teaching',
    items: [
      { path: '/teacher/study-notes', icon: BookOpen, label: 'Study Materials' },
      { path: '/teacher/past-papers', icon: FileText, label: 'Past Papers' },
      { path: '/teacher/tutorials', icon: PlayCircle, label: 'Tutorials' },
      { path: '/teacher/career-resources', icon: Briefcase, label: 'Career Resources' },
      { path: '/teacher/learning-paths', icon: GraduationCap, label: 'Learning Paths' },
      { path: '/teacher/schedule', icon: CalendarCheck, label: 'Class Schedule' },
      { path: '/teacher/study-groups', icon: Users, label: 'Study Groups' },
      { path: '/teacher/quizzes', icon: HelpCircle, label: 'Assignments & Quizzes' },
    ]
  },
  {
    label: 'Students',
    items: [
      { path: '/teacher/students', icon: Users, label: 'Students' },
      { path: '/teacher/attendance', icon: CalendarCheck, label: 'Attendance' },
      { path: '/teacher/insights', icon: TrendingUp, label: 'Insights' },
      { path: '/teacher/analytics', icon: BarChart2, label: 'Analytics & Reports' },
    ]
  },
  {
    label: 'Communication',
    items: [
      { path: '/teacher/discussions', icon: MessageCircle, label: 'Discussions / Q&A' },
      { path: '/teacher/collaboration', icon: MessageSquare, label: 'Teacher Collaboration' },
      { path: '/teacher/announcements', icon: Bell, label: 'Announcements' },
    ]
  },
];

const navLinkClass = (active, collapsed) =>
  cn(
    'flex items-center gap-3 rounded-2xl text-sm font-medium transition-all',
    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
    active
      ? 'bg-yellow-400 text-blue-950 font-semibold shadow-[0_8px_20px_-10px_rgba(250,204,21,0.55)]'
      : 'text-blue-100/85 hover:bg-blue-900/70 hover:text-white'
  );

export default function TeacherSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const { logout } = useAuth();

  /**
   * @param {string} path
   * @param {boolean} [exact]
   */
  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-shrink-0 flex-col border-r border-blue-900/80 bg-blue-950 text-blue-100 shadow-[0_0_40px_rgba(15,23,42,0.35)] transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Brand — matches main site header */}
      <div
        className={cn(
          'flex h-20 shrink-0 items-center border-b border-blue-900/80 bg-blue-950',
          collapsed ? 'justify-center px-3' : 'gap-3 px-4'
        )}
      >
        <div
          className={cn(
            'flex items-center rounded-2xl border border-yellow-400/50 bg-blue-900/50 transition-colors hover:bg-blue-800/60',
            collapsed ? 'p-2' : 'gap-3 px-3 py-2'
          )}
        >
          <div className="rounded-xl bg-white/95 p-1.5 shadow-[0_8px_20px_-10px_rgba(250,204,21,0.8)]">
            <img src="/Logo.png" alt="Learn Malawi" className="h-8 w-8 object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="whitespace-nowrap font-poppins text-base font-bold leading-tight text-white">
                Learn Malawi
              </p>
              <p className="whitespace-nowrap text-xs font-medium text-yellow-300">
                Teacher portal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-yellow-400/75">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ path, icon: Icon, label, exact }) => {
                const active = isActive(path, exact);
                return (
                  <Link
                    key={path}
                    to={path}
                    title={collapsed ? label : undefined}
                    className={navLinkClass(active, collapsed)}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        active ? 'text-blue-950' : 'text-yellow-400/90'
                      )}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto space-y-1 border-t border-blue-900/80 px-2 pb-3 pt-3">
        <Link
          to="/teacher/settings"
          title={collapsed ? 'Settings' : undefined}
          className={navLinkClass(location.pathname === '/teacher/settings', collapsed)}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && 'Settings'}
        </Link>
        <Link
          to="/teacher/history"
          title={collapsed ? 'History' : undefined}
          className={navLinkClass(location.pathname === '/teacher/history', collapsed)}
        >
          <Clock className="h-4 w-4 shrink-0" />
          {!collapsed && 'History'}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-2xl border border-transparent text-sm text-blue-200/90 transition-all hover:border-yellow-400/40 hover:bg-blue-900/70 hover:text-white',
            collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl text-sm font-medium text-blue-100/85 transition-all hover:bg-blue-900/70 hover:text-yellow-200',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
