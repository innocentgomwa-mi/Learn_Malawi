import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { fetchAnnouncements, fetchStudyNotes } from "@/api";

/**
 * @param {{ userName?: string, progressEntries?: Array<any> }} props
 */
export default function HeroGreetings({ userName, progressEntries = [] }) {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const progressMap = useMemo(() => {
    return progressEntries.reduce((map, entry) => {
      if (entry?.resource_id) {
        map[entry.resource_id] = entry;
      }
      return map;
    }, /** @type {Record<string, any>} */ ({}));
  }, [progressEntries]);

  const { data: studyNotesRaw = [] } = useQuery({
    queryKey: ['heroStudyNotes'],
    queryFn: () => fetchStudyNotes(),
    staleTime: 1000 * 60,
    initialData: [],
  });
  const studyNotes = /** @type {Array<{ id?: string; title?: string; body?: string; message?: string }>} */ (studyNotesRaw);

  const { data: announcements = [] } = useQuery({
    queryKey: ['heroAnnouncements'],
    queryFn: () => fetchAnnouncements({ published: true }),
    staleTime: 1000 * 60,
    initialData: [],
  });

  const completedCount = progressEntries.filter((entry) => entry?.completed).length;
  const activeSubjects = new Set(progressEntries.map((entry) => entry?.subject).filter(Boolean)).size;
  const currentStreak = Math.max(completedCount, 1);

  const nextStudyNote = useMemo(() => {
    const next = studyNotes.find((note) => note?.id && (!progressMap[note.id] || !progressMap[note.id].completed));
    return next?.title || studyNotes[0]?.title || "your next reading";
  }, [studyNotes, progressMap]);

  const nextAnnouncement = announcements[0];
  const announcementSnippet = nextAnnouncement?.body || nextAnnouncement?.message || "No new updates yet.";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium mb-1">{timeGreeting}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Hey, {userName || "Scholar"}! 👋</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            You have completed <span className="font-semibold text-gray-700">{completedCount}</span> study sessions across <span className="font-semibold text-gray-700">{activeSubjects}</span> subjects.
            Keep going — your next recommendation is <span className="font-semibold text-gray-700">{nextStudyNote}</span>.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/study-notes')} className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-5 text-sm h-9">
              Resume Reading
            </Button>
            <Button asChild variant="ghost" className="text-primary font-semibold rounded-lg gap-1.5 px-4 text-sm h-9 hover:bg-primary/5">
              <Link to="/study-notes">
                Explore Library <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex md:flex-col gap-3">
          {[
            { label: "Streak", value: `${currentStreak} days`, icon: Flame, accent: "text-primary" },
            { label: "Upcoming", value: nextAnnouncement?.title || "No updates", icon: CalendarDays, accent: "text-teal-500" },
            { label: "Saved Time", value: `${completedCount * 15}m`, icon: Clock, accent: "text-gray-500" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-w-[140px]"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  <Icon className={`w-3.5 h-3.5 ${s.accent}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                {i === 1 && <p className="text-sm font-semibold text-gray-500 mt-0.5">{announcementSnippet.slice(0, 26)}{announcementSnippet.length > 26 ? '…' : ''}</p>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}