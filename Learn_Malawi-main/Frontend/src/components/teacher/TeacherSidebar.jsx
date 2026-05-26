import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, Play, HelpCircle,
  Briefcase, Users, ClipboardList, BarChart2, MessageSquare,
  Megaphone, Settings, GraduationCap, Map
} from 'lucide-react';

const links = [
  { to: '/teacher', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/teacher/study-notes', label: 'Study Notes', icon: FileText },
  { to: '/teacher/past-papers', label: 'Past Papers', icon: BookOpen },
  { to: '/teacher/tutorials', label: 'Tutorials', icon: Play },
  { to: '/teacher/quizzes', label: 'Quizzes', icon: HelpCircle },
  { to: '/teacher/career-resources', label: 'Career Resources', icon: Briefcase },
  { to: '/teacher/study-groups', label: 'Study Groups', icon: Users },
  { to: '/teacher/learning-paths', label: 'Learning Paths', icon: Map },
  { to: '/teacher/students', label: 'Students', icon: GraduationCap },
  { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardList },
  { to: '/teacher/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/teacher/discussions', label: 'Discussions', icon: MessageSquare },
  { to: '/teacher/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/teacher/settings', label: 'Settings', icon: Settings },
];

export default function TeacherSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col py-6 px-3 gap-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Teacher Portal</p>
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
