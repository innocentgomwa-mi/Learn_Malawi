import React, { useEffect, useState } from "react";
import { Flame, Target, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { fetchStudentProgress } from "@/api";

const FALLBACK_STATS = [
  { icon: Flame, label: "Day Streak", value: "12", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Target, label: "Quiz Accuracy", value: "74%", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Clock, label: "Study Time", value: "26h", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: TrendingUp, label: "Weekly Goal", value: "68%", color: "text-purple-500", bg: "bg-purple-500/10" },
];

export default function PersonalStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    let mounted = true;
    if (!user?.email) return;

    fetchStudentProgress({ studentEmail: user.email })
      .then((entries) => {
        if (!mounted || !Array.isArray(entries) || entries.length === 0) return;

        const uniqueDays = new Set();
        let quizScoreTotal = 0;
        let quizScoreCount = 0;
        let studyMinutes = 0;
        let completedCount = 0;
        let totalCount = 0;

        entries.forEach((entry) => {
          const dateValue = entry.date || entry.created_at || entry.updated_at || entry.timestamp;
          if (dateValue) {
            const date = new Date(dateValue);
            if (!Number.isNaN(date.getTime())) {
              const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
              uniqueDays.add(key);
            }
          }

          totalCount += 1;
          const progress = Number(entry.completed_percent ?? entry.progress ?? 0);
          if (progress >= 100) completedCount += 1;

          const scoreValue = Number(entry.score ?? entry.percent ?? entry.accuracy ?? NaN);
          if (!Number.isNaN(scoreValue)) {
            quizScoreTotal += scoreValue;
            quizScoreCount += 1;
          }

          const duration = Number(entry.duration_minutes ?? entry.time_spent_minutes ?? entry.time_spent ?? 0);
          if (!Number.isNaN(duration)) {
            studyMinutes += duration;
          }
        });

        const streakValue = uniqueDays.size;
        const accuracyValue = quizScoreCount > 0 ? Math.round(quizScoreTotal / quizScoreCount) : 0;
        const weeklyGoalValue = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

        setStats([
          { icon: Flame, label: "Day Streak", value: `${streakValue}`, color: "text-orange-500", bg: "bg-orange-500/10" },
          { icon: Target, label: "Quiz Accuracy", value: `${accuracyValue}%`, color: "text-green-500", bg: "bg-green-500/10" },
          { icon: Clock, label: "Study Time", value: `${Math.round(studyMinutes / 60)}h`, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: TrendingUp, label: "Weekly Goal", value: `${weeklyGoalValue}%`, color: "text-purple-500", bg: "bg-purple-500/10" },
        ]);
      })
      .catch(() => {
        if (!mounted) return;
        setStats(FALLBACK_STATS);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="bg-card rounded-xl border p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-lg font-heading font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}