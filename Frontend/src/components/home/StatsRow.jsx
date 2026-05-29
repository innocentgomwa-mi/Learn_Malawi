import React from "react";
import { BookOpen, Users, Brain, Zap } from "lucide-react";

const defaultStats = [
  { icon: BookOpen, label: "Resources", value: "2,400+", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Users, label: "Study Groups", value: "140+", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Brain, label: "Quizzes", value: "550+", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Zap, label: "Students", value: "5,200+", color: "text-green-500", bg: "bg-green-500/10" },
];

/**
 * @param {{ resourcesCount?: number, quizCount?: number, studentCount?: number, studyGroupsCount?: number, loading?: boolean }} props
 */
export default function StatsRow({ resourcesCount, quizCount, studentCount, studyGroupsCount, loading }) {
  const stats = defaultStats.map((item) => ({ ...item }));

  if (typeof resourcesCount === "number") {
    stats[0].value = loading ? "Loading..." : `${resourcesCount} resources`;
  }
  if (typeof studyGroupsCount === "number") {
    stats[1].value = loading ? "Loading..." : `${studyGroupsCount} groups`;
  }
  if (typeof quizCount === "number") {
    stats[2].value = loading ? "Loading..." : `${quizCount} quizzes`;
  }
  if (typeof studentCount === "number") {
    stats[3].value = loading ? "Loading..." : `${studentCount} students`;
  }

  return (
    <section className="rounded-[28px] border border-yellow-500/50 bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200 shadow-sm p-6">
      <h2 className="text-xl font-heading font-bold mb-1 text-blue-950">Platform Overview</h2>
      <p className="text-sm text-blue-900/80 mb-4">What's available on Learn Malawi</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-blue-800/50 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-5 py-4 flex items-center gap-3 shadow-sm transition-colors hover:from-blue-900 hover:to-blue-700"
          >
            <div className="w-9 h-9 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
              <Icon className="text-yellow-300" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-white">{value}</p>
              <p className="text-xs text-blue-100/80">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}