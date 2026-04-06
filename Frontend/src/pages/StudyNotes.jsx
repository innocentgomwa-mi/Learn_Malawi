// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/lib/AuthContext";
import { fetchStudyNotes } from "@/api";
import { loadUserProgress, saveUserProgress } from "@/lib/dashboardStorage";
import { BookOpen, Search, ChevronRight, FileText, CheckCircle, Circle } from "lucide-react";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const LEVEL_INFO = {
  PSLC: { label: "Standard 1–8", color: "bg-emerald-100 text-emerald-700" },
  JCE: { label: "Form 1–2", color: "bg-blue-100 text-blue-700" },
  MSCE: { label: "Form 3–4", color: "bg-purple-100 text-purple-700" },
};


export default function StudyNotes() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({}); // resource_id -> Progress record
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
          {selected.summary && (
            <div className="bg-accent/50 border border-accent rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-accent-foreground">📌 Summary</p>
              <p className="text-sm mt-1 text-foreground">{selected.summary}</p>
            </div>
          )}
          <div className="prose max-w-none text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {selected.content || "Content coming soon. Check back later!"}
          </div>
          {selected.fileUrl && (
            <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
              <FileText className="h-4 w-4" /> Download PDF
            </a>
          )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setSelected(note)}
                    className="bg-card border border-border rounded-xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEVEL_INFO[note.level]?.color || "bg-muted text-muted-foreground"}`}>
                        {note.level}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm leading-snug mb-1">{note.title}</h3>
                    {note.topic && <p className="text-xs text-muted-foreground">{note.topic}</p>}
                    {note.grade && <p className="text-xs text-muted-foreground mt-1">{note.grade}</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}