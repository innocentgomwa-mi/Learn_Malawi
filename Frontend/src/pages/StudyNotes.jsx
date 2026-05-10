// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from "@/lib/AuthContext";
import { fetchStudyNotes, fetchStudentProgress, recordStudentProgress } from "@/api";
import { loadUserProgress, saveUserProgress } from "@/lib/dashboardStorage";
import { getSavedNotes, saveNoteOffline, removeNoteOffline } from "@/lib/offlineCache";
import NoteQuiz from "@/components/NoteQuiz";
import RequireAccount from "@/components/RequireAccount";
import SaveOfflineButton from "@/components/SaveOfflineButton";
import TextToSpeech from "@/components/TextToSpeech";
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
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState({}); 
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [selected, setSelected] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  const [isDeviceOnline, setIsDeviceOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [searchParams] = useSearchParams();
  const subjectFilter = searchParams.get('subject') || '';
  const selectedNoteId = searchParams.get('selected_id') || '';

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

    if (isDeviceOnline && user?.email) {
      fetchStudentProgress({ studentEmail: user.email, entryType: 'study' })
        .then((entries) => {
          if (Array.isArray(entries) && entries.length > 0) {
            const backendProgress = entries.reduce((acc, entry) => {
              if (entry?.resource_id) {
                acc[entry.resource_id] = entry;
              }
              return acc;
            }, {});
            setProgress((prev) => ({ ...prev, ...backendProgress }));
          }
        })
        .catch((error) => {
          console.error('Unable to load study progress from backend:', error);
        });
    }
  }, [user, isDeviceOnline]);

  useEffect(() => {
    if (!selectedNoteId || notes.length === 0) return;
    const selectedNote = notes.find((note) => note.id === selectedNoteId);
    if (selectedNote) {
      setSelected(selectedNote);
    }
  }, [selectedNoteId, notes]);

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsDeviceOnline(online);
      if (!online) {
        setSavedNotes(getSavedNotes());
      }
    };

    setSavedNotes(getSavedNotes());
    updateStatus();

    window.addEventListener('offline', updateStatus);
    window.addEventListener('online', updateStatus);

    return () => {
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('online', updateStatus);
    };
  }, []);

  const { data: notes = [], isLoading: loading } = useQuery({
    queryKey: ['studyNotes', level, search, subjectFilter],
    queryFn: () => fetchStudyNotes({
      level: level === 'All' ? undefined : level,
      subject: subjectFilter || undefined,
      search,
    }),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: isAuthenticated && isDeviceOnline,
  });

  const notesToDisplay = isDeviceOnline ? notes : savedNotes;

  const saveOfflineNote = (note) => {
    saveNoteOffline(note);
    setSavedNotes(getSavedNotes());
  };

  const removeOfflineNote = (noteId) => {
    removeNoteOffline(noteId);
    setSavedNotes(getSavedNotes());
  };

  const isSavedNote = (noteId) => {
    return savedNotes.some((n) => n.id === noteId);
  };

  const toggleComplete = async (note) => {
    const existing = progress[note.id];
    const updated = {
      id: note.id,
      student_email: user?.email,
      entry_type: 'study',
      resource_id: note.id,
      resource_type: "study_note",
      resource_title: note.title,
      completed: !existing?.completed,
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

    if (user?.email) {
      try {
        await recordStudentProgress(updated);
      } catch (error) {
        console.error('Unable to save study progress to backend:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return <RequireAccount resourceName="Study Notes" />;
  }

  const filtered = notesToDisplay.filter((n) => {
    const matchLevel = level === "All" || n.level === level;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || n.subject?.toLowerCase().includes(subjectFilter.toLowerCase());
    return matchLevel && matchSearch && matchSubject;
  });

  const notesToRender = filtered;

  if (selected) {
    return (
      <div className="w-full px-4 py-8">
        <button onClick={() => setSelected(null)} className="text-sm text-primary flex items-center gap-1 mb-6 hover:underline">
          ← Back to Study Notes
        </button>
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEVEL_INFO[selected.level]?.color || "bg-muted text-muted-foreground"}`}>
                {selected.level}
              </span>
              {selected.grade && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{selected.grade}</span>}
              {selected.topic && <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">{selected.topic}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
              <div onClick={(event) => event.stopPropagation()}>
                <SaveOfflineButton
                  isSaved={isSavedNote(selected.id)}
                  onSave={() => saveOfflineNote(selected)}
                  onRemove={() => removeOfflineNote(selected.id)}
                />
              </div>
            </div>
          </div>
          <h1 className="font-poppins text-2xl font-bold text-foreground mb-2">{selected.title}</h1>
          <p className="text-muted-foreground text-sm mb-2">{selected.subject}</p>
          <div className="mb-4">
            <TextToSpeech text={`${selected.title}. ${selected.content || selected.summary || ''}`} />
          </div>

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
    <div className="w-full px-4 py-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notesToRender.map((note) => {
            const completed = progress[note.id]?.completed;
            return (
              <div
                key={note.id}
                onClick={() => setSelected(note)}
                className="group cursor-pointer flex flex-col basis-full overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-25px_rgba(15,23,42,0.4)]"
              >
                      <div className="relative h-56 overflow-hidden" style={getCoverStyle(note)}>
                        <div className="absolute inset-0 bg-slate-950/20" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_35%)]" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm">
                              {note.level || "N/A"}
                            </span>
                            {note.topic && (
                              <span className="inline-flex rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                                {note.topic}
                              </span>
                            )}
                            {completed && (
                              <span className="inline-flex rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
                                Completed
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-white leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.title}</h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-500">
                          <span className="rounded-full border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 bg-slate-50">{note.subject || 'General'}</span>
                          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-500">{note.grade || 'All grades'}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-5 leading-6" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{truncateSummary(note.summary || note.content)}</p>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 uppercase tracking-[0.18em]">
                            <span className={`inline-flex rounded-full px-2.5 py-1 ${note.fileUrl ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                              {note.fileUrl ? 'Downloadable' : 'Read online'}
                            </span>
                          </div>
                          <div onClick={(event) => event.stopPropagation()}>
                            <SaveOfflineButton
                              isSaved={isSavedNote(note.id)}
                              onSave={() => saveOfflineNote(note)}
                              onRemove={() => removeOfflineNote(note.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
        </div>
      )}
    </div>
  );
}