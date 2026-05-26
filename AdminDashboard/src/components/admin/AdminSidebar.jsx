import React from "react";
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  GraduationCap,
  Users,
  Megaphone,
  BookOpen,
  LogOut,
  ActivitySquare,
  Shield,
  ShieldCheck,
  MonitorDot,
  Archive,
  Wrench,
  BarChart2,
  KeyRound,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

const SECTIONS = [
  {
    group: "Overview",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "reports", label: "Reports & Analytics", icon: BarChart2 },
      { id: "insights", label: "Insights", icon: ClipboardCheck },
      { id: "search-analytics", label: "Search Analytics", icon: Search },
    ]
  },
  {
    group: "Users & Access",
    items: [
      { id: "students", label: "Students", icon: Users },
      { id: "teachers", label: "Teachers", icon: GraduationCap },
      { id: "roles", label: "Roles & Permissions", icon: KeyRound },
      { id: "sessions", label: "Sessions", icon: MonitorDot },
    ]
  },
  {
    group: "Content",
    items: [
      { id: "approvals", label: "Published Resources", icon: BookOpen },
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "study-groups", label: "Study Groups", icon: Users },
    ]
  },
  {
    group: "Security & Audit",
    items: [
      { id: "security", label: "Security Center", icon: Shield },
      { id: "logs", label: "Audit Logs", icon: ActivitySquare },
    ]
  },
  {
    group: "System",
    items: [
      { id: "health", label: "System Health", icon: ShieldCheck },
      { id: "backups", label: "Backups", icon: Archive },
      { id: "maintenance", label: "Maintenance Mode", icon: Wrench },
    ]
  },
];

export default function AdminSidebar({ activeSection, onNavigate, onToggle, collapsed }) {
  const { logout } = useAuth();

  return (
    <div className={`h-full bg-blue-950 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center border-b border-blue-900 h-16 ${collapsed ? 'justify-center px-3' : 'px-5 gap-3'}`}>
        <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-950" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-base leading-tight">Learn Malawi</p>
            <p className="text-xs text-blue-400">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {SECTIONS.map(({ group, items }) => (
          <div key={group}>
            {!collapsed && (
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider px-3 mb-1">{group}</p>
            )}
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                title={collapsed ? label : undefined}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'} rounded-lg text-sm font-medium transition-all
                  ${activeSection === id
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-blue-300 hover:bg-blue-900 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="flex-1 text-left">{label}</span>}
                {!collapsed && activeSection === id && <ChevronRight className="w-3 h-3 opacity-60" />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-blue-800 space-y-3">
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'} rounded-lg border border-blue-700 bg-blue-900 text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors`}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Collapse</span></>}
        </button>
        <button
          onClick={() => logout()}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-0 py-2.5' : 'justify-start px-3 py-2.5'} rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
