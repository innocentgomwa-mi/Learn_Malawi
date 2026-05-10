import React from "react";
import { BookOpen, Users, Brain, Zap } from "lucide-react";

const defaultStats = [
  { icon: BookOpen, label: "Resources", value: "2,400+", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Users, label: "Study Groups", value: "140+", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Brain, label: "Quizzes", value: "550+", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Zap, label: "Students", value: "5,200+", color: "text-green-500", bg: "bg-green-500/10" },
];

/**
 * @param {{ resourcesCount?: number, studyGroupsCount?: number, loading?: boolean }} props
 */
export default function StatsRow({ resourcesCount, studyGroupsCount, loading }) {
  const stats = defaultStats.map((item) => ({ ...item }));

  if (typeof resourcesCount === "number") {
    stats[0].value = loading ? "Loading..." : `${resourcesCount} resources`;
  }
  if (typeof studyGroupsCount === "number") {
    stats[1].value = loading ? "Loading..." : `${studyGroupsCount} groups`;
  }

  return (
    <div>
      <h2 className="text-xl font-heading font-bold mb-1">Platform Overview</h2>
      <p className="text-sm text-muted-foreground mb-4">What's available on Learn Malawi</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="bg-card rounded-xl border px-5 py-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4.5 w-4.5 ${color}`} style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-lg font-heading font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}