import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext.jsx";
import { fetchStudentProgress } from "@/api";

const FALLBACK_RECENT = [
  {
    key: "fallback-quadratic-notes",
    title: "Quadratic Equations – Notes",
    subject: "Mathematics",
    type: "Notes",
    progress: 72,
    timeLeft: "~8 min left",
    color: "bg-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-600",
  },
  {
    key: "fallback-msce-biology-paper",
    title: "MSCE Biology 2023 Paper 1",
    subject: "Biology",
    type: "Past Paper",
    progress: 45,
    timeLeft: "~20 min left",
    color: "bg-green-500",
    badgeColor: "bg-green-500/10 text-green-600",
  },
  {
    key: "fallback-chemical-bonding-tutorial",
    title: "Chemical Bonding Tutorial",
    subject: "Chemistry",
    type: "Tutorial",
    progress: 90,
    timeLeft: "Almost done!",
    color: "bg-purple-500",
    badgeColor: "bg-purple-500/10 text-purple-600",
  },
];

export default function ContinueLearning() {
  const { user } = useAuth();
  const [recent, setRecent] = useState(FALLBACK_RECENT);

  useEffect(() => {
    let mounted = true;
    if (!user?.email) return;

    fetchStudentProgress({ studentEmail: user.email })
      .then((entries) => {
        if (!mounted || !Array.isArray(entries) || entries.length === 0) return;

        setRecent(
          entries.slice(0, 4).map((entry, index) => ({
            key: `${entry.title || entry.name || "Learning Path"}-${entry.subject || entry.topic || "General"}-${index}`,
            title: entry.title || entry.name || "Learning Path",
            subject: entry.subject || entry.topic || "General",
            type: entry.entryType || entry.type || "Learning",
            progress: Number(entry.progress ?? entry.completed_percent ?? 0),
            timeLeft: entry.time_left || entry.remaining_time || "In progress",
            color: entry.color || "bg-blue-500",
            badgeColor: entry.badgeColor || "bg-blue-500/10 text-blue-600",
          }))
        );
      })
      .catch(() => {
        if (!mounted) return;
        setRecent(FALLBACK_RECENT);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Continue Learning</h2>
          <p className="text-sm text-muted-foreground">Pick up where you left off</p>
        </div>
        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
          History <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {recent.map((item) => (
          <div
            key={item.key || `${item.title}-${item.subject}`}
            className="bg-card rounded-xl border p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className={`w-1 self-stretch rounded-full ${item.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold font-heading truncate">{item.title}</h4>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 shrink-0 ${item.badgeColor}`}>
                  {item.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{item.subject}</p>
              <div className="flex items-center gap-3">
                <Progress value={item.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">{item.progress}%</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}