import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminNotifications from "@/components/admin/AdminNotifications";
import PostApprovals from "@/components/admin/PostApprovals";
import ManageTeachers from "@/components/admin/ManageTeachers";
import ManageStudents from "@/components/admin/ManageStudents";
import ManageAnnouncements from "@/components/admin/ManageAnnouncements";
import ActivityLogViewer from "@/components/admin/ActivityLogViewer";
import SecurityCenter from "@/components/admin/SecurityCenter";
import AdminProfile from "@/components/admin/AdminProfile";
import SystemHealth from "@/components/admin/SystemHealth";
import BackupMonitor from "@/components/admin/BackupMonitor";
import InsightsDashboard from "@/components/admin/InsightsDashboard";
import MaintenanceMode from "@/components/admin/MaintenanceMode";
import RolesPermissions from "@/components/admin/RolesPermissions";
import SessionsViewer from "@/components/admin/SessionsViewer";
import ReportsAnalytics from "@/components/admin/ReportsAnalytics";
import StudyGroupsMonitor from "@/components/admin/StudyGroupsMonitor";
import SearchAnalytics from "@/components/admin/SearchAnalytics";
import { Menu, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/AuthContext";
import { usePageLogger } from "@/hooks/usePageLogger";
import { useRefreshRate } from '@/lib/RefreshRateContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  usePageLogger("login", { resource_title: "Admin Dashboard" });
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1024;
  });
  const { refreshSeconds, setRefreshSeconds, refreshOptions } = useRefreshRate();
  const { unreadCount } = useAdminNotifications();
  const { user } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case "profile": return <AdminProfile />;
      case "overview": return <AdminOverview refreshSeconds={refreshSeconds} />;
      case "notifications": return <AdminNotifications onOpenSection={(section) => setActiveSection(section)} />;
      case "approvals": return <PostApprovals />;
      case "teachers": return <ManageTeachers />;
      case "students": return <ManageStudents />;
      case "announcements": return <ManageAnnouncements />;
      case "logs": return <ActivityLogViewer refreshSeconds={refreshSeconds} />;
      case "security": return <SecurityCenter />;
      case "health": return <SystemHealth />;
      case "backups": return <BackupMonitor />;
      case "insights": return <InsightsDashboard />;
      case "maintenance": return <MaintenanceMode />;
      case "study-groups": return <StudyGroupsMonitor refreshSeconds={refreshSeconds} />;
      case "roles": return <RolesPermissions />;
      case "sessions": return <SessionsViewer refreshSeconds={refreshSeconds} />;
      case "reports": return <ReportsAnalytics />;
      case "search-analytics": return <SearchAnalytics />;
      default: return <AdminOverview refreshSeconds={refreshSeconds} />;
    }
  };

  const contentMarginClass = sidebarExpanded ? 'lg:ml-64' : 'lg:ml-[68px]';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300
        ${sidebarExpanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <AdminSidebar
          activeSection={activeSection}
          collapsed={!sidebarExpanded}
          onNavigate={(section) => { setActiveSection(section); setSidebarExpanded(false); }}
          onToggle={() => setSidebarExpanded((expanded) => !expanded)}
        />
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${contentMarginClass}`}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarExpanded(true)} className="p-1 rounded-md hover:bg-gray-100 lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-800">Learn Malawi Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection("notifications")}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-[0.65rem] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="text-sm text-slate-500">Auto refresh</div>
            <Select value={String(refreshSeconds)} onValueChange={(value) => setRefreshSeconds(Number(value))}>
              <SelectTrigger className="h-9 min-w-[12rem] text-sm">
                <SelectValue placeholder="Off" />
              </SelectTrigger>
              <SelectContent>
                {refreshOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setActiveSection("profile")}
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              title="My profile"
            >
              <Avatar className="h-7 w-7">
                {user?.profileImageUrl ? <AvatarImage src={user.profileImageUrl} alt="" /> : null}
                <AvatarFallback className="bg-blue-700 text-white text-xs font-bold">
                  {(user?.firstName || user?.full_name || user?.email || "A").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline font-semibold">
                {user?.firstName || user?.full_name || "Admin"}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}