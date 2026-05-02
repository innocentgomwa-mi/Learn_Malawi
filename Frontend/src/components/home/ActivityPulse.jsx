import React from "react";
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fetchAnnouncements } from "@/api";

const fallbackActivities = [
  { title: "New chapter unlocked", desc1: "Continue your latest lesson", desc2: "Stay on track with your study plan" },
  { title: "Study reminder", desc1: "4 study sessions this week", desc2: "Keep momentum going" },
  { title: "New announcement", desc1: "Check your dashboard for updates", desc2: "Latest school news" },
];

export default function ActivityPulse() {
  const { data: announcements = [] } = useQuery({
    queryKey: ['activityAnnouncements'],
    queryFn: () => fetchAnnouncements({ published: true }),
    staleTime: 1000 * 60,
    initialData: [],
  });

  const activities = (Array.isArray(announcements) ? announcements : [])
    .slice(0, 3)
    .map((announcement) => ({
      title: announcement.title || announcement.message || 'New announcement',
      desc1: announcement.body ? announcement.body.slice(0, 36) : 'Tap to read the latest update',
      desc2: announcement.published_at ? new Date(announcement.published_at).toLocaleDateString() : null,
    }));

  const items = activities.length ? activities : fallbackActivities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Activity Feed</h3>
        <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
          See all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Activity items */}
      <div className="space-y-2">
        {items.map((act, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer group transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-gray-500">•</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 leading-snug">{act.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{act.desc1}</p>
                {act.desc2 && <p className="text-[11px] text-gray-400 truncate">{act.desc2}</p>}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
            </motion.div>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">UPCOMING DEADLINES</p>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-900 mb-1">Today's Study Goal</p>
          <p className="text-xs text-gray-400 mb-3">2 hours · 45 min comjated  37.5% complete · 73 min to go</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "37.5%" }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}