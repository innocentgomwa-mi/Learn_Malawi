import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Bell, BookOpen, MessageCircle, CalendarCheck, Clock, Megaphone, ChevronDown, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchResources, fetchStudyBlocks, fetchExams, fetchChatMessages, fetchAnnouncements, fetchTeachers } from "@/api";
import { markNotificationsAsRead, markChatMessagesAsSeen } from "@/lib/notificationStorage";

const TYPE_CONFIG = {
  exam:      { icon: CalendarCheck,   color: "bg-rose-500",   badge: "bg-rose-50 text-rose-700 border-rose-200",   label: "Exam" },
  resource:  { icon: BookOpen,        color: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200",   label: "Resource" },
  study:     { icon: Clock,           color: "bg-slate-500",  badge: "bg-slate-50 text-slate-700 border-slate-100", label: "Study Block" },
  announcement: { icon: Megaphone,      color: "bg-amber-500",  badge: "bg-amber-50 text-amber-700 border-amber-200",   label: "Announcement" },
  message:   { icon: MessageCircle,   color: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Message" },
};

/**
 * @typedef {{
 *   id: string;
 *   type: 'exam' | 'resource' | 'study';
 *   title: string;
 *   subtitle?: string;
 *   body: string;
 *   date?: string;
 *   url?: string;
 *   urgent: boolean;
 * }} NotificationItem
 */

/** @param {string | number | null | undefined} v */
const formatDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

/** @param {string | number | null | undefined} dateStr */
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = Number(new Date(dateStr)) - Date.now();
  return Math.ceil(diff / 86400000);
};

export default function Notifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(/** @type {Array<{ id: string; type: 'exam' | 'resource' | 'study' | 'message'; title: string; subtitle?: string; body: string; date?: string; url?: string; urgent: boolean; }>} */ ([]));
  const [expanded, setExpanded] = useState(/** @type {string | null} */ (null));
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const teacherFetchPromise = user?.role?.toLowerCase() !== 'student' ? fetchTeachers() : Promise.resolve([]);
        const [resources, studyBlocks, exams, chatMessages, teachers, announcements] = await Promise.all([
          fetchResources(),
          fetchStudyBlocks(),
          fetchExams(),
          fetchChatMessages({ room: 'general' }),
          teacherFetchPromise.catch(() => []),
          fetchAnnouncements({ published: true }),
        ]);
        if (!active) return;

        const supportedResources = Array.isArray(resources) ? resources : [];
        const supportedStudyBlocks = Array.isArray(studyBlocks) ? studyBlocks : [];
        const supportedExams = Array.isArray(exams) ? exams : [];
        const supportedChatMessages = Array.isArray(chatMessages) ? chatMessages : [];
        const supportedTeachers = Array.isArray(teachers) ? teachers : [];
        const supportedAnnouncements = Array.isArray(announcements) ? announcements : [];
        const teacherEmails = new Set(supportedTeachers.map((teacher) => String(teacher.email || '').toLowerCase()));

        const notifs = [
        ...supportedExams.map((e) => {
          const days = daysUntil(e.exam_date || e.created_date || e.createdAt || e.updatedAt);
          const urgent = days !== null && days <= 7 && days >= 0;
          return {
            id: `exam-${e.id}`,
            type: "exam",
            title: `Upcoming exam: ${e.title}`,
            subtitle: e.subject,
            body: `${e.subject} exam${e.location ? ` at ${e.location}` : ""}. ${days === 0 ? "Today!" : days === 1 ? "Tomorrow!" : days !== null && days > 0 ? `In ${days} days.` : "Check your schedule."}`,
            date: e.exam_date || e.created_date || e.createdAt || e.updatedAt || "",
            urgent,
          };
        }),
        ...supportedResources.map((r) => ({
          id: `resource-${r.id}`,
          type: "resource",
          title: `New resource added: ${r.name || r.title || "Resource"}`,
          subtitle: r.subject || "General",
          body: `A new ${String(r.type || r.resource_type || "resource").replace(/_/g, " ")} has been added${r.subject ? ` for ${r.subject}` : ""}. ${r.url ? "Click to open the resource." : ""}`,
          date: r.created_date || r.createdAt || r.updatedAt || "",
          url: r.url,
          urgent: false,
        })),
        ...supportedStudyBlocks.map((s) => ({
          id: `study-${s.id}`,
          type: "study",
          title: `Study block: ${s.title || s.name || "Study session"}`,
          subtitle: s.subject || s.day_of_week,
          body: `Scheduled for ${s.day_of_week || "a day"} from ${s.start_time || "?"} to ${s.end_time || "?"}${s.subject ? ` — ${s.subject}` : ""}.${s.notes ? ` Notes: ${s.notes}` : ""}`,
          date: s.created_date || s.createdAt || s.updatedAt || "",
          urgent: false,
        })),
        ...supportedChatMessages
          .filter((m) => {
            if (!user) return true;
            const isSelf = m.sender_email === user.email;
            const isTeacher = teacherEmails.has(String(m.sender_email || '').toLowerCase());
            return !isSelf && !isTeacher;
          })
          .map((m) => ({
            id: `message-${m.id}`,
            type: "message",
            title: `New message from ${m.sender_name || m.sender_email || "Someone"}`,
            subtitle: m.room || "General chat",
            body: m.message || "",
            date: m.created_date || m.createdAt || m.created_at || "",
            urgent: false,
          })),
        ...supportedAnnouncements
          .filter((announcement) => {
            const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();
            if (user?.role?.toLowerCase() === 'teacher') {
              return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user.email;
            }
            return audience === 'all' || audience === 'students';
          })
          .map((announcement) => ({
            id: `announcement-${announcement.id}`,
            type: "announcement",
            title: announcement.title,
            subtitle: announcement.targetAudience === 'students' ? 'From your teacher' : 'Announcement',
            body: announcement.body || "",
            date: announcement.createdAt || announcement.created_at || "",
            urgent: (announcement.priority || 'normal') === 'high',
          })),
      ];

      const sortedNotifs = notifs.sort((a, b) => Number(new Date(b.date || "")) - Number(new Date(a.date || "")));

      if (user?.email) {
        const announcementIds = supportedAnnouncements
          .filter((announcement) => {
            const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();
            if (user.role?.toLowerCase() === 'teacher') {
              return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user.email;
            }
            return audience === 'all' || audience === 'students';
          })
          .map((announcement) => announcement?.id)
          .filter(Boolean);

        if (announcementIds.length > 0) {
          markNotificationsAsRead(user.email, announcementIds, user.role);
        }

        const chatDates = supportedChatMessages
          .map((message) => new Date(message.created_date || message.createdAt || message.created_at))
          .filter((date) => !Number.isNaN(date.getTime()));

        if (chatDates.length > 0) {
          const latestChatDate = new Date(Math.max(...chatDates.map((date) => date.getTime())));
          markChatMessagesAsSeen(user.email, 'general', latestChatDate, user.role);
        }
      }

      setItems(/** @type {NotificationItem[]} */ (sortedNotifs));
      } catch (error) {
        console.error('Failed loading notifications', error);
        if (active) {
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { active = false; };
  }, [user?.email, user?.role]);
  const FILTERS = ["All", "Exam", "Resource", "Study Block", "Messages", "Announcement"];

  const filtered = useMemo(() => items.filter((i) => {
    if (filter === "All") return true;
    return TYPE_CONFIG[i.type]?.label === filter;
  }), [items, filter]);

  const summary = useMemo(() => ({
    total: items.length,
    urgent: items.filter((i) => i.urgent).length,
    exams: items.filter((i) => i.type === "exam").length,
    resources: items.filter((i) => i.type === "resource").length,
    messages: items.filter((i) => i.type === "message").length,
  }), [items]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Hero header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent p-6 sm:p-8 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold mb-3">
                <Bell className="h-3.5 w-3.5" /> Notification Centre
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold">Your Notifications</h1>
              <p className="mt-1 text-white/70 text-sm">Stay on top of exams, resources and study sessions.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 shrink-0">
              {[
                { label: "Total", value: summary.total },
                { label: "Urgent", value: summary.urgent },
                { label: "Exams", value: summary.exams },
                { label: "Resources", value: summary.resources },
                { label: "Messages", value: summary.messages },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-xl font-heading font-bold">{value}</p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >{f}</button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <CheckCheck className="h-3.5 w-3.5" />
            {filtered.length} notifications
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
            <div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
            Loading notifications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">Nothing to show for this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const cfg = TYPE_CONFIG[item.type];
              const Icon = cfg.icon;
              const isOpen = expanded === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md ${item.urgent ? "border-rose-300 ring-1 ring-rose-200" : ""}`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold font-heading truncate">{item.title}</p>
                        {item.urgent && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-rose-50 text-rose-700 border-rose-200 border shrink-0">Urgent</Badge>
                        )}
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border shrink-0 ${cfg.badge}`}>{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle} · {formatDate(item.date)}</p>
                    </div>

                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 border-t border-border/60">
                      <p className="text-sm text-muted-foreground leading-relaxed mt-3">{item.body}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary hover:underline"
                        >
                          Open Resource →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}