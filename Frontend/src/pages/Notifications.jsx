import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Bell, BookOpen, MessageCircle, CalendarCheck, Clock, Megaphone, ChevronDown, CheckCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  fetchResources,
  fetchStudyBlocks,
  fetchExams,
  fetchChatMessages,
  fetchAnnouncements,
  fetchTeachers,
  fetchAdminNotifications,
  fetchClassSchedules,
} from "@/api";
import { markNotificationsAsRead, markChatMessagesAsSeen } from "@/lib/notificationStorage";
import {
  buildNotificationsFromSources,
  buildTeacherEmailSet,
  isAnnouncementForRole,
  normalizeNotificationRole,
  roleUsesGeneralChatNotifications,
  roleUsesPersonalScheduleNotifications,
} from "@/lib/notificationFilters";

const TYPE_CONFIG = {
  exam: { icon: CalendarCheck, color: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-200", label: "Exam" },
  resource: { icon: BookOpen, color: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", label: "Resource" },
  study: { icon: Clock, color: "bg-slate-500", badge: "bg-slate-50 text-slate-700 border-slate-100", label: "Study Block" },
  announcement: { icon: Megaphone, color: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Announcement" },
  message: { icon: MessageCircle, color: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-800 border-yellow-200", label: "Message" },
  admin: { icon: ShieldAlert, color: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Admin" },
};

/** @param {string | number | null | undefined} v */
const formatDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export default function Notifications() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(/** @type {string | null} */ (null));
  const [filter, setFilter] = useState("All");

  const userRole = normalizeNotificationRole(user?.role);

  useEffect(() => {
    if (!user?.email) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const role = user.role;
        const isAdmin = userRole === 'admin';
        const usesSchedule = roleUsesPersonalScheduleNotifications(role);
        const usesChat = roleUsesGeneralChatNotifications(role);

        const [
          resources,
          studyBlocks,
          exams,
          classSchedules,
          chatMessages,
          teachers,
          announcements,
          adminNotifications,
        ] = await Promise.all([
          usesSchedule ? fetchResources().catch(() => []) : Promise.resolve([]),
          usesSchedule ? fetchStudyBlocks().catch(() => []) : Promise.resolve([]),
          usesSchedule ? fetchExams().catch(() => []) : Promise.resolve([]),
          userRole === 'teacher' ? fetchClassSchedules().catch(() => []) : Promise.resolve([]),
          usesChat
            ? fetchChatMessages({ room: 'general', notificationFeed: true }).catch(() => [])
            : Promise.resolve([]),
          usesChat && userRole === 'student'
            ? fetchTeachers().catch(() => [])
            : Promise.resolve([]),
          fetchAnnouncements({ published: true }).catch(() => []),
          isAdmin ? fetchAdminNotifications().catch(() => []) : Promise.resolve([]),
        ]);

        if (!active) return;

        const teacherEmails = buildTeacherEmailSet(teachers);
        const supportedAnnouncements = Array.isArray(announcements) ? announcements : [];
        const sortedNotifs = buildNotificationsFromSources({
          role,
          userEmail: user.email,
          exams: Array.isArray(exams) ? exams : [],
          resources: Array.isArray(resources) ? resources : [],
          studyBlocks: Array.isArray(studyBlocks) ? studyBlocks : [],
          classSchedules: Array.isArray(classSchedules) ? classSchedules : [],
          chatMessages: Array.isArray(chatMessages) ? chatMessages : [],
          announcements: supportedAnnouncements,
          adminNotifications: Array.isArray(adminNotifications) ? adminNotifications : [],
          teacherEmails,
        });

        const announcementIds = supportedAnnouncements
          .filter((announcement) => isAnnouncementForRole(announcement, role, user.email))
          .map((announcement) => announcement?.id)
          .filter(Boolean);

        const readIds = [...announcementIds];
        if (isAdmin && Array.isArray(adminNotifications)) {
          readIds.push(...adminNotifications.map((item) => `admin-${item.id}`).filter(Boolean));
        }
        if (readIds.length > 0) {
          markNotificationsAsRead(user.email, readIds, user.role);
        }

        if (usesChat) {
          const supportedChatMessages = Array.isArray(chatMessages) ? chatMessages : [];
          const chatDates = supportedChatMessages
            .map((message) => new Date(message.created_date || message.createdAt || message.created_at))
            .filter((date) => !Number.isNaN(date.getTime()));

          if (chatDates.length > 0) {
            const latestChatDate = new Date(Math.max(...chatDates.map((date) => date.getTime())));
            markChatMessagesAsSeen(user.email, 'general', latestChatDate, user.role);
          }
        }

        setItems(sortedNotifs);
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
  }, [user?.email, user?.role, userRole]);

  const FILTERS = useMemo(() => {
    const base = ["All", "Announcement"];
    if (userRole === 'admin') {
      return [...base, "Admin"];
    }
    return [...base, "Exam", "Resource", "Study Block", "Messages"];
  }, [userRole]);

  const filtered = useMemo(() => items.filter((item) => {
    if (filter === "All") return true;
    return TYPE_CONFIG[item.type]?.label === filter;
  }), [items, filter]);

  const summary = useMemo(() => ({
    total: items.length,
    urgent: items.filter((item) => item.urgent).length,
    exams: items.filter((item) => item.type === "exam").length,
    resources: items.filter((item) => item.type === "resource").length,
    messages: items.filter((item) => item.type === "message").length,
    admin: items.filter((item) => item.type === "admin").length,
  }), [items]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const heroSubtitle =
    userRole === 'admin'
      ? 'Platform alerts and admin updates for your account only.'
      : userRole === 'teacher'
        ? 'Teacher announcements, schedule items, and student messages.'
        : 'Student announcements, your schedule, and peer messages.';

  const summaryCards =
    userRole === 'admin'
      ? [
          { label: "Total", value: summary.total },
          { label: "Urgent", value: summary.urgent },
          { label: "Admin", value: summary.admin },
        ]
      : [
          { label: "Total", value: summary.total },
          { label: "Urgent", value: summary.urgent },
          { label: "Exams", value: summary.exams },
          { label: "Resources", value: summary.resources },
          { label: "Messages", value: summary.messages },
        ];

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-background pb-28 md:pb-36">
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8 xl:px-10 box-border">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 sm:p-8 text-white">
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
              <p className="mt-1 text-white/70 text-sm">{heroSubtitle}</p>
            </div>
            <div className={`grid gap-3 shrink-0 ${summaryCards.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5'}`}>
              {summaryCards.map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-xl font-heading font-bold">{value}</p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filter === f
                  ? "border-yellow-300 bg-yellow-400 text-blue-950 hover:bg-yellow-300"
                  : "bg-card text-muted-foreground border-border hover:text-yellow-800 hover:border-yellow-300 hover:bg-yellow-50"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <CheckCheck className="h-3.5 w-3.5" />
            {filtered.length} notifications
          </div>
        </div>

        <div>
        {loading ? (
          <div className="flex items-center justify-center bg-card border rounded-2xl p-12 text-center text-muted-foreground min-h-[280px]">
            <div>
              <div className="w-7 h-7 border-4 border-border border-t-yellow-500 rounded-full animate-spin mx-auto mb-3" />
              Loading notifications…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center bg-card border rounded-2xl p-12 text-center min-h-[280px]">
            <div>
              <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">Nothing to show for your role in this filter.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
              const Icon = cfg.icon;
              const isOpen = expanded === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md ${item.urgent ? "border-rose-300 ring-1 ring-rose-200" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </div>

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
                          className="inline-flex items-center gap-1.5 mt-3 rounded-full border border-yellow-300 bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-blue-950 transition-colors hover:bg-yellow-300"
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
    </div>
  );
}
