import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, HelpCircle, Users, BarChart2,
  MessageSquare, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  GraduationCap, PlayCircle, CalendarCheck
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
      { path: '/teacher/quizzes', icon: HelpCircle, label: 'Assignments & Quizzes' },
    ]
  },
  {
    label: 'Students',
    items: [
      { path: '/teacher/students', icon: Users, label: 'Students' },
      { path: '/teacher/attendance', icon: CalendarCheck, label: 'Attendance' },
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
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  /**
   * @param {string} path
   * @param {boolean} [exact]
   */
  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <aside className={cn(
      'min-h-screen bg-[hsl(220,28%,14%)] flex flex-col transition-all duration-300 ease-in-out',
      collapsed ? 'w-[68px]' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-white/10 h-16', collapsed ? 'justify-center px-3' : 'px-5 gap-3')}>
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">Learn Malawi</p>
            <p className="text-emerald-400 text-xs whitespace-nowrap">Teacher Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
        {groups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-2 mb-1.5">
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
                      'flex items-center gap-3 rounded-lg text-sm font-medium transition-all group',
                      collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                      active
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
            'flex items-center gap-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
            location.pathname === '/teacher/settings' && 'bg-emerald-600 text-white'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && 'Settings'}
        </Link>
        <button
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className={cn(
            'flex items-center gap-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'flex items-center gap-3 w-full rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all mt-2',
            collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}