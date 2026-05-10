import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, HelpCircle, Users, BarChart2,
  MessageSquare, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  GraduationCap, PlayCircle, CalendarCheck, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

/** @type {Array<{ label: string, items: Array<{ path: string, icon: any, label: string, exact?: boolean }> }>} */
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
      { path: '/teacher/learning-paths', icon: GraduationCap, label: 'Learning Paths' },
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
      { path: '/teacher/discussions', icon: MessageSquare, label: 'Discussions / Q&A' },
      { path: '/teacher/announcements', icon: Bell, label: 'Announcements' },
    ]
  },
];

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
    <aside className={cn(
      'min-h-screen bg-blue-950 text-blue-100 flex flex-col transition-all duration-300 ease-in-out shadow-[0_0_40px_rgba(15,23,42,0.35)]',
      collapsed ? 'w-[68px]' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-blue-900/80 h-16', collapsed ? 'justify-center px-3' : 'px-5 gap-3')}>
        <div className="w-10 h-10 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm leading-tight whitespace-nowrap">Learn Malawi</p>
            <p className="text-blue-300 text-xs whitespace-nowrap">Teacher Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
        {groups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 px-2 mb-1.5">
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
                    className={cn(
                      'flex items-center gap-3 rounded-2xl text-sm font-medium transition-all group',
                      collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_8px_24px_rgba(59,130,246,0.18)]'
                        : 'text-blue-300 hover:bg-blue-900 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-white/10 pt-3">
        <Link
          to="/teacher/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-2xl text-sm font-medium transition-all',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
            location.pathname === '/teacher/settings'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_8px_24px_rgba(59,130,246,0.18)]'
              : 'text-blue-300 hover:bg-blue-900 hover:text-white'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && 'Settings'}
        </Link>
        <button
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className={cn(
            'flex items-center gap-3 w-full rounded-2xl text-sm font-medium transition-all',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
            'text-blue-200 hover:bg-blue-800 hover:text-white'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'flex items-center gap-3 w-full rounded-2xl text-sm transition-all mt-2',
            collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2',
            'text-blue-300 hover:text-white hover:bg-blue-800'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}