import React, { useEffect, useState } from "react";
import { Flame, ArrowRight } from "lucide-react";
import { fetchResources } from "@/api";

const FALLBACK_SUBJECTS = [
  { name: "Mathematics", resources: 312, emoji: "📐", bg: "bg-blue-500" },
  { name: "Biology", resources: 198, emoji: "🧬", bg: "bg-green-500" },
  { name: "Chemistry", resources: 176, emoji: "⚗️", bg: "bg-purple-500" },
  { name: "Physics", resources: 154, emoji: "⚡", bg: "bg-amber-500" },
  { name: "English", resources: 230, emoji: "📖", bg: "bg-rose-500" },
];

const SUBJECT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-fuchsia-500",
];

export default function SubjectSpotlight() {
  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);

  useEffect(() => {
    let mounted = true;

    fetchResources()
      .then((resources) => {
        if (!mounted || !Array.isArray(resources) || resources.length === 0) return;

        const counts = resources.reduce((acc, item) => {
          const subject = (item.subject || item.name || "General").toString();
          acc[subject] = (acc[subject] || 0) + 1;
          return acc;
        }, {});

        const topSubjects = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count], index) => ({
            name,
            resources: count,
            emoji: name.charAt(0).toUpperCase(),
            bg: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
          }));

        if (topSubjects.length > 0) {
          setSubjects(topSubjects);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setSubjects(FALLBACK_SUBJECTS);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-base flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" /> Subjects
        </h2>
        <button className="text-xs text-primary font-medium flex items-center gap-1">
          All <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1">
        {subjects.map((s) => (
          <button
            key={s.name}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors text-left group"
          >
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center text-sm shrink-0`}>
              {s.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.resources} resources</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}