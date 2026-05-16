import React, { useState, useEffect } from "react";
import StudentProgressOverview from "@/components/student/StudentProgressOverview";
import StudentSearchResources from "@/components/student/StudentSearchResources";
import StudentRecentActivity from "@/components/student/StudentRecentActivity";
import { BookOpen, BarChart2, Search, History } from "lucide-react";
import { usePageLogger } from "@/hooks/usePageLogger";

const TABS = [
  { id: "progress", label: "My Progress", icon: BarChart2 },
  { id: "resources", label: "Search Resources", icon: Search },
  { id: "recent", label: "Recent Activity", icon: History },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("progress");
  const [currentUser, setCurrentUser] = useState(null);
  usePageLogger("resource_viewed", { resource_title: "Student Dashboard" });

  useEffect(() => {
    apiClient.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white px-4 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-bold">Learn Malawi</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">
            Welcome back{currentUser?.full_name ? `, ${currentUser.full_name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-blue-300 text-sm mt-1">Track your progress and explore learning resources</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${activeTab === id
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "progress" && <StudentProgressOverview currentUser={currentUser} />}
        {activeTab === "resources" && <StudentSearchResources currentUser={currentUser} />}
        {activeTab === "recent" && <StudentRecentActivity currentUser={currentUser} />}
      </div>
    </div>
  );
}
