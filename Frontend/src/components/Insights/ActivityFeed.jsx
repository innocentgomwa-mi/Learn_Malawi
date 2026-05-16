// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LogIn, LogOut, Download, MousePointer, BookOpen, FileText, Play, Eye, ClipboardList } from "lucide-react";

const EVENT_ICONS = {
  page_visit: Eye,
  login: LogIn,
  logout: LogOut,
  download: Download,
  click: MousePointer,
  quiz_start: ClipboardList,
  quiz_complete: ClipboardList,
  video_play: Play,
  note_view: BookOpen,
  past_paper_view: FileText,
};

const EVENT_COLORS = {
  login: "bg-green-100 text-green-700",
  logout: "bg-gray-100 text-gray-600",
  download: "bg-blue-100 text-blue-700",
  quiz_complete: "bg-purple-100 text-purple-700",
  quiz_start: "bg-indigo-100 text-indigo-700",
  page_visit: "bg-slate-100 text-slate-600",
  click: "bg-yellow-100 text-yellow-700",
  video_play: "bg-orange-100 text-orange-700",
  note_view: "bg-teal-100 text-teal-700",
  past_paper_view: "bg-rose-100 text-rose-700",
};

export default function ActivityFeed({ activities }) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {activities.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No activity recorded yet.</p>
      )}
      {activities.map((a) => {
        const Icon = EVENT_ICONS[a.event_type] || Eye;
        return (
          <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className={`p-2 rounded-lg flex-shrink-0 ${EVENT_COLORS[a.event_type] || "bg-gray-100 text-gray-600"}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-gray-800">{a.user_name || a.user_email}</span>
                <Badge variant="outline" className="text-xs capitalize">{a.event_type?.replace(/_/g, " ")}</Badge>
                {a.page_section && <Badge variant="secondary" className="text-xs capitalize">{a.page_section?.replace(/_/g, " ")}</Badge>}
              </div>
              <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                {a.subject && <span>📚 {a.subject}</span>}
                {a.level && <span>🎓 {a.level}</span>}
                {a.duration_seconds && <span>⏱ {Math.round(a.duration_seconds / 60)}m</span>}
                {a.resource_name && <span>📄 {a.resource_name}</span>}
              </div>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {format(new Date(a.created_date), "HH:mm")}
            </span>
          </div>
        );
      })}
    </div>
  );
}