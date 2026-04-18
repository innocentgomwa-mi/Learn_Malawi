// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/lib/AuthContext";
import { fetchStudyNotes } from "@/api";
import { loadUserProgress, saveUserProgress } from "@/lib/dashboardStorage";
import NoteQuiz from "@/components/NoteQuiz";
import { BookOpen, Search, ChevronRight, FileText, CheckCircle, Circle } from "lucide-react";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const LEVEL_INFO = {
  PSLC: { label: "Standard 1–8", color: "bg-emerald-100 text-emerald-700" },
  JCE: { label: "Form 1–2", color: "bg-blue-100 text-blue-700" },
  MSCE: { label: "Form 3–4", color: "bg-purple-100 text-purple-700" },
};

const SUBJECT_COVERS = {
  Mathematics: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
  Science: "linear-gradient(135deg, #059669 0%, #0ea5e9 100%)",
  English: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  History: "linear-gradient(135deg, #c2410c 0%, #c026d3 100%)",
  Geography: "linear-gradient(135deg, #0f766e 0%, #164e63 100%)",
  Computer: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
  Biology: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
  Chemistry: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
  Physics: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getRemoteUrl = (value) => {
  if (!value) return value;
  return value.startsWith('/') ? `${API_BASE_URL}${value}` : value;
};

const getCoverStyle = (note) => {
  if (note.imageUrl) {
    const imageUrl = getRemoteUrl(note.imageUrl);
    return {
      backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.45), rgba(15,23,42,0.15)), url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    backgroundImage: SUBJECT_COVERS[note.subject] || "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
};

const truncateSummary = (summary) => {
  if (!summary) return "No summary available yet.";
  return summary.length > 120 ? `${summary.slice(0, 117)}...` : summary;
};


export default function StudyNotes() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({}); 
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const userKey = user?.id || user?.email;
    if (!userKey) {
      setProgress({});
      return;
    }

    const storedProgress = loadUserProgress(userKey);
    const progressMap = storedProgress.reduce((acc, entry) => {
      if (entry?.resource_id) {
        acc[entry.resource_id] = entry;
      }
      return acc;
    }, {});

    setProgress(progressMap);
  }, [user]);

  const { data: notes = [], isLoading: loading } = useQuery({
    queryKey: ['studyNotes', level, search],
    queryFn: () => fetchStudyNotes({ level: level === 'All' ? undefined : level, search }),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const toggleComplete = (note) => {
    const existing = progress[note.id];
    const updated = {
      id: note.id,
      resource_id: note.id,
      completed: !existing?.completed,
      resource_type: "study_note",
      resource_title: note.title,
      subject: note.subject,
      level: note.level,
    };

    setProgress((prev) => {
      const next = { ...prev, [note.id]: updated };
      const userKey = user?.id || user?.email;
      if (userKey) {
        saveUserProgress(userKey, Object.values(next));
      }
      return next;
    });
  };

  const filtered = notes.filter((n) => {
    const matchLevel = level === "All" || n.level === level;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  // Group by subject
  const grouped = filtered.reduce((acc, note) => {
    const key = note.subject || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  if (selected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setSelected(null)} className="text-sm text-primary flex items-center gap-1 mb-6 hover:underline">
          ← Back to Study Notes
        </button>
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEVEL_INFO[selected.level]?.color || "bg-muted text-muted-foreground"}`}>
                {selected.level}
              </span>
              {selected.grade && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{selected.grade}</span>}
              {selected.topic && <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">{selected.topic}</span>}
            </div>
            <button
              onClick={() => toggleComplete(selected)}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl border transition-all ${
                progress[selected.id]?.completed
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {progress[selected.id]?.completed
                ? <><CheckCircle className="h-4 w-4" /> Completed</>
                : <><Circle className="h-4 w-4" /> Mark Complete</>
              }
            </button>
          </div>
          <h1 className="font-poppins text-2xl font-bold text-foreground mb-2">{selected.title}</h1>
          <p className="text-muted-foreground text-sm mb-6">{selected.subject}</p>

          <div className="prose max-w-none text-foreground text-sm leading-relaxed whitespace-pre-wrap mb-6">
            {selected.content || "Full notes are not available yet. Check back later for full learning materials."}
          </div>

          {selected.summary && (
            <div className="bg-accent/50 border border-accent rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-accent-foreground">📌 Summary</p>
              <p className="text-sm mt-1 text-foreground">{selected.summary}</p>
            </div>
          )}

          {selected.fileUrl && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Additional learning materials</p>
              <a href={getRemoteUrl(selected.fileUrl)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
                <FileText className="h-4 w-4" /> Download supporting document
              </a>
            </div>
          )}

          <NoteQuiz note={selected} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" /> Study Notes
        </h1>
        <p className="text-muted-foreground">Curriculum-aligned notes for all levels and subjects</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                level === l ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No study notes found yet.</p>
          <p className="text-muted-foreground text-sm mt-1">Content will be added soon. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([subject, subjectNotes]) => (
            <div key={subject}>
              <h2 className="font-poppins font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
                {subject}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectNotes.map((note) => {
                  const completed = progress[note.id]?.completed;
                  return (
                    <button
                      key={note.id}
                      onClick={() => setSelected(note)}
                      className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-52 overflow-hidden" style={getCoverStyle(note)}>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_40%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.75))]" />
                        <div className="absolute left-4 top-4 flex flex-col gap-2">
                          {note.topic && (
                            <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                              {note.topic}
                            </span>
                          )}
                        </div>
                        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm">
                          <span>{note.level || "N/A"}</span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <h3 className="text-lg font-semibold leading-tight max-h-[3.2rem] overflow-hidden">{note.title}</h3>
                        </div>
                      </div>
                      <div className="p-5 bg-white">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">{note.grade || "General"}</span>
                            <span>{note.fileUrl ? "Downloadable" : "Read online"}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-6">{truncateSummary(note.summary || note.content)}</p>
                        <div className="text-xs uppercase tracking-[0.16em]">
                          <span className="text-emerald-600 transition-colors group-hover:text-slate-900">View details →</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}