// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from "@/lib/AuthContext";
import { fetchStudyNotes, fetchStudentProgress, recordStudentProgress, logActivity } from "@/api";
import { loadUserProgress, saveUserProgress } from "@/lib/dashboardStorage";
import { getSavedNotes, saveNoteOffline, removeNoteOffline } from "@/lib/offlineCache";
import NoteQuiz from "@/components/NoteQuiz";
import RequireAccount from "@/components/RequireAccount";
import ResourceSearchInput from "@/components/ResourceSearchInput";
import SaveOfflineButton from "@/components/SaveOfflineButton";
import TextToSpeech from "@/components/TextToSpeech";
import { BookOpen, ChevronRight, FileText, CheckCircle, Circle } from "lucide-react";

const matchesOfflineSearch = (note, term) => {
  if (!term.trim()) return true;
  const q = term.trim().toLowerCase();
  return (
    note.title?.toLowerCase().includes(q) ||
    note.subject?.toLowerCase().includes(q) ||
    note.topic?.toLowerCase().includes(q) ||
    note.summary?.toLowerCase().includes(q) ||
    note.grade?.toLowerCase().includes(q)
  );
};

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const LEVEL_INFO = {
  PSLC: { label: "Standard 1–8", color: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  JCE: { label: "Form 1–2", color: "bg-blue-100 text-blue-800 border border-blue-200" },
  MSCE: { label: "Form 3–4", color: "bg-blue-900/10 text-blue-900 border border-blue-300" },
};

const PAGE_WRAP = "w-full max-w-full overflow-x-hidden box-border px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 md:pb-40";

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
  const [lastSearchSignature, setLastSearchSignature] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [isDeviceOnline, setIsDeviceOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [searchParams] = useSearchParams();
  const subjectFilter = searchParams.get('subject') || '';
  const selectedNoteId = searchParams.get('selected_id') || '';

  const { data: notes = [], isLoading: loading, isFetching } = useQuery({
    queryKey: ['studyNotes', level, search, subjectFilter],
    queryFn: () => fetchStudyNotes({
      level: level === 'All' ? undefined : level,
      subject: subjectFilter || undefined,
      search: search.trim() || undefined,
    }),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: isAuthenticated && isDeviceOnline,
  });

  useEffect(() => {
    const signature = `${search.trim()}|${level}|${subjectFilter}`;
    if (signature === lastSearchSignature) return;
    if (!search.trim() && level === 'All' && !subjectFilter) return;

    const timer = setTimeout(() => {
      logActivity({
        action: 'resource_searched',
        user_email: user?.email || 'anonymous',
        user_name: user?.full_name || '',
        user_role: user?.role || 'student',
        resource_title: 'Study Notes',
        subject: search.trim() || 'all',
        metadata: JSON.stringify({ query: search.trim(), level, subjectFilter }),
      }).catch(() => {});
      setLastSearchSignature(signature);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, level, subjectFilter, user?.email, user?.full_name, user?.role, lastSearchSignature]);

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
    const selectedNote = notes.find((note) => String(note.id) === String(selectedNoteId));
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

  const notesToDisplay = isDeviceOnline
    ? notes
    : savedNotes.filter((n) => {
        const matchLevel = level === "All" || n.level === level;
        const matchSubject =
          !subjectFilter || n.subject?.toLowerCase().includes(subjectFilter.toLowerCase());
        return matchLevel && matchSubject && matchesOfflineSearch(n, search);
      });

  const hasActiveFilters = Boolean(search.trim()) || level !== "All" || Boolean(subjectFilter);

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

  const notesToRender = notesToDisplay;

  if (selected) {
    return (
      <div className={PAGE_WRAP}>
        <div className="bg-white border border-blue-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEVEL_INFO[selected.level]?.color || "bg-muted text-muted-foreground"}`}>
                {selected.level}
              </span>
              {selected.grade && <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded-full">{selected.grade}</span>}
              {selected.topic && <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-1 rounded-full">{selected.topic}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleComplete(selected)}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl border transition-all ${
                  progress[selected.id]?.completed
                    ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                    : "border-blue-200 text-blue-900/70 hover:border-yellow-300 hover:bg-yellow-50 hover:text-blue-950"
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
          <h1 className="font-poppins text-2xl font-bold text-blue-950 mb-2">{selected.title}</h1>
          <p className="text-blue-900/80 text-sm mb-2">{selected.subject}</p>
          <div className="mb-4">
            <TextToSpeech text={`${selected.title}. ${selected.content || selected.summary || ''}`} />
          </div>

          <div className="max-w-none text-blue-950/90 text-sm leading-relaxed whitespace-pre-wrap mb-6">
            {selected.content || "Full notes are not available yet. Check back later for full learning materials."}
          </div>

          {selected.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-blue-900">Summary</p>
              <p className="text-sm mt-1 text-blue-900/80">{selected.summary}</p>
            </div>
          )}

          {selected.fileUrl && (
            <div className="rounded-3xl border border-blue-200/80 bg-blue-50/50 p-5">
              <p className="text-sm font-semibold text-blue-950 mb-3">Additional learning materials</p>
              <a
                href={getRemoteUrl(selected.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-400 px-4 py-2 text-sm font-semibold text-blue-950 transition-colors hover:bg-yellow-300"
              >
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
    <div className={PAGE_WRAP}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 sm:p-8 text-white mb-8 shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-400/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
        </div>
        <div className="relative">
          <h1 className="font-poppins text-3xl font-bold mb-2 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-yellow-400" /> Study Notes
          </h1>
          <p className="text-blue-100/90 max-w-2xl">
            Curriculum-aligned notes for all levels and subjects
            {subjectFilter ? ` · Showing ${subjectFilter}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-8 lg:flex-row lg:items-stretch">
        <ResourceSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, subject, topic, or summary..."
          ariaLabel="Search study notes"
          isFetching={isFetching}
          isLoading={loading}
          className="relative min-w-0 flex-1"
        />
        <div className="flex min-w-0 flex-wrap gap-2 lg:max-w-[min(100%,28rem)] lg:justify-end">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`shrink-0 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                level === l
                  ? "border border-yellow-300 bg-yellow-400 text-blue-950 shadow-sm"
                  : "bg-white border border-blue-200 text-blue-900 hover:border-yellow-300 hover:bg-yellow-50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : notesToRender.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-blue-200/80 bg-white">
          <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-950 font-medium">
            {hasActiveFilters ? "No study notes match your search." : "No study notes found yet."}
          </p>
          <p className="text-blue-900/70 text-sm mt-1">
            {hasActiveFilters
              ? "Try a different keyword or clear your filters."
              : "Content will be added soon. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 items-stretch isolate">
          {notesToRender.map((note) => {
            const completed = progress[note.id]?.completed;
            return (
              <div
                key={note.id}
                onClick={() => {
                  setSelected(note);
                  logActivity({
                    action: 'resource_viewed',
                    user_email: user?.email || 'anonymous',
                    user_name: user?.full_name || '',
                    user_role: user?.role || 'student',
                    resource_title: note.title,
                    subject: note.subject,
                    level: note.level,
                    metadata: JSON.stringify({ resource_id: note.id, resource_type: 'study_note' }),
                  }).catch(() => {});
                }}
                className="group relative z-0 flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-blue-200/80 bg-white shadow-[0_12px_30px_-20px_rgba(30,58,138,0.25)] transition-shadow duration-300 hover:border-yellow-300/80 hover:shadow-[0_18px_45px_-25px_rgba(30,58,138,0.35)]"
              >
                      <div className="relative h-52 sm:h-56 shrink-0 overflow-hidden" style={getCoverStyle(note)}>
                        <div className="absolute inset-0 bg-slate-950/20" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_35%)]" />
                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                          <div className="mb-2 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex max-w-full rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-900 shadow-sm">
                              {note.level || "N/A"}
                            </span>
                            {note.topic && (
                              <span className="inline-flex max-w-full truncate rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                                {note.topic}
                              </span>
                            )}
                            {completed && (
                              <span className="inline-flex rounded-full bg-yellow-400 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-950 shadow-sm">
                                Completed
                              </span>
                            )}
                          </div>
                          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white sm:text-xl">{note.title}</h3>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                          <span className="rounded-full border border-blue-200 px-2.5 py-1 font-semibold text-blue-900 bg-blue-50">{note.subject || 'General'}</span>
                          <span className="rounded-full border border-blue-100 px-2.5 py-1 text-blue-800/80 bg-white">{note.grade || 'All grades'}</span>
                        </div>
                        <p className="text-sm text-blue-900/75 mb-5 leading-6 flex-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{truncateSummary(note.summary || note.content)}</p>
                        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${note.fileUrl ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                            {note.fileUrl ? 'Downloadable' : 'Read online'}
                          </span>
                          <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
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