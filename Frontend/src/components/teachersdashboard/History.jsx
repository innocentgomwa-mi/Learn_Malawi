import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileText, PlayCircle, CalendarCheck, Search, TrendingUp, Layers, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";
import { filterByTeacher, sortByLatest } from "./teacherUtils";
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes } from "@/api";

/**
 * @typedef {{ id: string; source: string; title: string; rawDate: string; details: string; url?: string }} HistoryEntry
 * @typedef {{ id: string; name: string; type: string; updated_date?: string; created_date?: string; subject?: string; url?: string }} ResourceItem
 * @typedef {{ id: string; title: string; day_of_week: string; start_time: string; end_time: string; subject?: string; updated_date?: string; created_date?: string }} StudyBlockItem
 * @typedef {{ id: string; title: string; subject?: string; exam_date?: string; updated_date?: string; created_date?: string; location?: string }} ExamItem
 */

const SOURCE_CONFIG = /** @type {Record<string, { icon: any; color: string; light: string }>} */ ({
  "Study Notes": { icon: BookOpen,     color: "bg-blue-500",   light: "bg-blue-50 text-blue-700 border-blue-100" },
  "Past Papers": { icon: FileText,     color: "bg-amber-500",  light: "bg-amber-50 text-amber-700 border-amber-100" },
  "Tutorials":   { icon: PlayCircle,   color: "bg-purple-500", light: "bg-purple-50 text-purple-700 border-purple-100" },
  "Quizzes":     { icon: CalendarCheck, color: "bg-rose-500",   light: "bg-rose-50 text-rose-700 border-rose-100" },
});

const TYPE_LABELS = ["All", "Study Notes", "Past Papers", "Tutorials", "Quizzes"];

/** @param {string | number | null | undefined} value */
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

/** @param {string | number | null | undefined} value */
const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const FILTERS = TYPE_LABELS;

export default function History() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(/** @type {HistoryEntry[]} */ ([]));
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [notes, papers, tutorials, quizzes] = await Promise.all([
          fetchStudyNotes({ teacherEmail: user.email }),
          fetchPastPapers({ teacherEmail: user.email }),
          fetchTutorials({ teacherEmail: user.email }),
          fetchQuizzes({ teacherEmail: user.email }),
        ]);

        if (!active) return;

        const filteredNotes = filterByTeacher(notes, user.email);
        const filteredPapers = filterByTeacher(papers, user.email);
        const filteredTutorials = filterByTeacher(tutorials, user.email);
        const filteredQuizzes = filterByTeacher(quizzes, user.email);

        const mapped = [
          ...sortByLatest(filteredNotes).map((item) => ({
            id: `note-${item.id}`,
            source: "Study Notes",
            title: item.title || item.name || "Untitled note",
            rawDate: item.updated_date || item.created_date || item.createdAt || item.updatedAt || "",
            details: [item.subject, item.level, item.grade].filter(Boolean).join(' · '),
          })),
          ...sortByLatest(filteredPapers).map((item) => ({
            id: `paper-${item.id}`,
            source: "Past Papers",
            title: item.title || item.name || "Untitled paper",
            rawDate: item.updated_date || item.created_date || item.createdAt || item.updatedAt || "",
            details: [item.subject, item.level, item.year].filter(Boolean).join(' · '),
          })),
          ...sortByLatest(filteredTutorials).map((item) => ({
            id: `tutorial-${item.id}`,
            source: "Tutorials",
            title: item.title || item.name || "Untitled tutorial",
            rawDate: item.updated_date || item.created_date || item.createdAt || item.updatedAt || "",
            details: [item.subject, item.level, item.class || item.class_level].filter(Boolean).join(' · '),
          })),
          ...sortByLatest(filteredQuizzes).map((item) => ({
            id: `quiz-${item.id}`,
            source: "Quizzes",
            title: item.title || item.name || "Untitled quiz",
            rawDate: item.updated_date || item.created_date || item.createdAt || item.updatedAt || "",
            details: [item.subject, item.class || item.class_level, `${(item.questions?.length ?? item.total_questions ?? 0)} questions`].filter(Boolean).join(' · '),
          })),
        ].sort((a, b) => {
          const aTime = new Date(a.rawDate || '').getTime() || 0;
          const bTime = new Date(b.rawDate || '').getTime() || 0;
          return bTime - aTime;
        });

        setItems(mapped);
      } catch (error) {
        console.error('Failed loading teacher history', error);
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
  }, [user]);

  const summary = useMemo(() => ({
    total: items.length,
    notes: items.filter((i) => i.source === "Study Notes").length,
    papers: items.filter((i) => i.source === "Past Papers").length,
    tutorials: items.filter((i) => i.source === "Tutorials").length,
    quizzes: items.filter((i) => i.source === "Quizzes").length,
  }), [items]);

  const filtered = useMemo(() => items.filter((i) => {
    const matchFilter = activeFilter === "All" || i.source === activeFilter;
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.details.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [items, activeFilter, search]);

  // Group by date
  const grouped = useMemo(() => {
    /** @type {Record<string, HistoryEntry[]>} */
    const groups = {};
    filtered.forEach((item) => {
      const key = formatDate(item.rawDate);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Teacher Dashboard</p>
            <h1 className="text-3xl font-heading font-bold">Activity History</h1>
            <p className="text-sm text-muted-foreground mt-1">Your recent teaching activity across notes, papers, tutorials and quizzes.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-card border rounded-lg px-3 py-2">
            <Activity className="h-3.5 w-3.5 text-green-500" />
            Live
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total Activities", value: summary.total, icon: Layers, color: "text-primary", bg: "bg-primary/10" },
            { label: "Study Notes", value: summary.notes, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-500/10" },
            { label: "Past Papers", value: summary.papers, icon: FileText, color: "text-amber-600", bg: "bg-amber-500/10" },
            { label: "Tutorials", value: summary.tutorials, icon: PlayCircle, color: "text-purple-600", bg: "bg-purple-500/10" },
            { label: "Quizzes", value: summary.quizzes, icon: CalendarCheck, color: "text-rose-600", bg: "bg-rose-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeFilter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
            Loading activity history…
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
            No records match your search.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, entries]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold text-muted-foreground bg-background px-2">{date}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  {entries.map((entry) => {
                    const cfg = SOURCE_CONFIG[entry.source] || SOURCE_CONFIG["Notes"];
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={entry.id}
                        className="bg-card border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 group"
                      >
                        {/* Color dot + icon */}
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center`}>
                            <Icon className="h-4.5 w-4.5 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold font-heading truncate">{entry.title}</p>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border shrink-0 ${cfg.light}`}>
                              {entry.source}
                            </Badge>
                          </div>
                          {entry.details && <p className="text-xs text-muted-foreground truncate">{entry.details}</p>}
                        </div>

                        {/* Time */}
                        <div className="text-xs text-muted-foreground shrink-0 text-right">
                          <p>{formatTime(entry.rawDate)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}