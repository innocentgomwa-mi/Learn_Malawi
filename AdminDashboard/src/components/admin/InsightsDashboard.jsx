import React, { useState } from "react";
import PlatformOverviewInsights from "./insights/PlatformOverviewInsights";
import ContentPerformanceInsights from "./insights/ContentPerformanceInsights";
import StudentOutcomesInsights from "./insights/StudentOutcomesInsights";
import { Activity, BookOpen, GraduationCap } from "lucide-react";

const TABS = [
  { id: "platform", label: "Platform Overview", icon: Activity },
  { id: "content", label: "Content Performance", icon: BookOpen },
  { id: "students", label: "Student Outcomes", icon: GraduationCap },
];

export default function InsightsDashboard() {
  const [activeTab, setActiveTab] = useState("platform");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Insights</h2>
        <p className="text-sm text-gray-500 mt-0.5">In-depth analytics across the entire Learn Malawi platform</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "platform" && <PlatformOverviewInsights />}
      {activeTab === "content" && <ContentPerformanceInsights />}
      {activeTab === "students" && <StudentOutcomesInsights />}
    </div>
  );
}