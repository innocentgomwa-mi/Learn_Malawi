import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import PostApprovals from "@/components/admin/PostApprovals";
import ManageTeachers from "@/components/admin/ManageTeachers";
import ManageStudents from "@/components/admin/ManageStudents";
import ManageAnnouncements from "@/components/admin/ManageAnnouncements";
import ActivityLogViewer from "@/components/admin/ActivityLogViewer";
import SecurityCenter from "@/components/admin/SecurityCenter";
import SystemHealth from "@/components/admin/SystemHealth";
import BackupRestore from "@/components/admin/BackupRestore";
import MaintenanceMode from "@/components/admin/MaintenanceMode";
import RolesPermissions from "@/components/admin/RolesPermissions";
import SessionsViewer from "@/components/admin/SessionsViewer";
import ReportsAnalytics from "@/components/admin/ReportsAnalytics";
import { Menu } from "lucide-react";
import { usePageLogger } from "@/hooks/usePageLogger";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  usePageLogger("login", { resource_title: "Admin Dashboard" });
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <AdminOverview />;
      case "approvals": return <PostApprovals />;
      case "teachers": return <ManageTeachers />;
      case "students": return <ManageStudents />;
      case "announcements": return <ManageAnnouncements />;
      case "logs": return <ActivityLogViewer />;
      case "security": return <SecurityCenter />;
      case "health": return <SystemHealth />;
      case "backups": return <BackupRestore />;
      case "maintenance": return <MaintenanceMode />;
      case "roles": return <RolesPermissions />;
      case "sessions": return <SessionsViewer />;
      case "reports": return <ReportsAnalytics />;
      default: return <AdminOverview />;
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
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarExpanded(true)} className="p-1 rounded-md hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-800">Learn Malawi Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}