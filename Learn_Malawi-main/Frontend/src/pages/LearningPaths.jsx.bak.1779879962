// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "@/lib/AuthContext";
import { fetchLearningPaths, fetchStudentProgress, fetchStudyNotes, fetchResources, deleteLearningPath, recordStudentProgress } from '@/api';
import { Map as MapIcon, BookOpen, CheckCircle, Circle, Lock, ChevronRight, Loader2, Sparkles } from "lucide-react";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const LEVEL_COLORS = {
  PSLC: "bg-sky-100 text-sky-700 border-sky-300",
  JCE: "bg-blue-100 text-blue-700 border-blue-300",
  MSCE: "bg-purple-100 text-purple-700 border-purple-300",
};

const milestoneResourceId = (pathId, milestone, index) => milestone.id || `${pathId}-${index}`;

const normalizeMilestone = (pathId, milestone, completedResourceIds, completedMilestoneIds, index) => {
  const ids = milestone.resource_ids || [];
  const resourceComplete = ids.length > 0 && ids.every(id => completedResourceIds.has(id));
  const stableId = milestoneResourceId(pathId, milestone, index);
  const explicitComplete = completedMilestoneIds.has(stableId);
  return resourceComplete || explicitComplete;
};

export default function LearningPaths() {
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [progress, setProgress] = useState([]);
  const [notes, setNotes] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("All");
  const [subject, setSubject] = useState("");
  const [activePath, setActivePath] = useState(null);
  const [searchParams] = useSearchParams();
  const selectedPathId = searchParams.get('path_id');
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [p, prog, n, r] = await Promise.all([
          fetchLearningPaths({}),
          user ? fetchStudentProgress({ studentEmail: user.email }) : Promise.resolve([]),
          fetchStudyNotes({}),
          fetchResources(),
        ]);

        if (!isMounted) return;
        setPaths(Array.isArray(p) ? p : p?.data ?? []);
        setProgress(Array.isArray(prog) ? prog : prog?.data ?? []);
        setNotes(Array.isArray(n) ? n : n?.data ?? []);
        setResources(Array.isArray(r) ? r : r?.data ?? []);
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setPaths([]);
        setProgress([]);
        setNotes([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (selectedPathId) {
      const matchedPath = paths.find((p) => String(p.id) === selectedPathId);
      setActivePath(matchedPath || null);
    } else {
      setActivePath(null);
    }
  }, [loading, selectedPathId, paths]);

  const completedResourceIds = new Set(progress.filter(p => p.completed && p.entry_type !== 'learning_path' && p.entry_type !== 'learning_path_milestone').map(p => p.resource_id));
  const completedMilestoneIds = new Set(progress.filter(p => p.completed && p.entry_type === 'learning_path_milestone').map(p => p.resource_id));
  const startedPathIds = new Set(progress.filter(p => p.entry_type === 'learning_path' && p.resource_type === 'learning_path').map(p => p.resource_id));

  const hasStartedPath = (path, done) => startedPathIds.has(path.id) || done > 0;

  const filtered = paths.filter(p => {
    if (level !== "All" && p.level !== level) return false;
    if (subject && !p.subject?.toLowerCase().includes(subject.toLowerCase())) return false;
    return true;
  });

  const subjects = [...new Set(paths.map(p => p.subject).filter(Boolean))];
  const allResourceMap = new Map([
    ...(notes || []).map((item) => [item.id, item]),
    ...(resources || []).map((item) => [item.id, item]),
  ]);

  const getResourceLabel = (item) => item?.title || item?.name || 'Resource';

  const getResourceUrl = (resource) => {
    if (!resource) return null;
    const rawUrl = resource.url || resource.fileUrl || resource.videoUrl || resource.paperUrl;
    if (!rawUrl) return null;
    return rawUrl.startsWith('/') ? `${API_BASE_URL}${rawUrl}` : rawUrl;
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedPathId) {
      navigate(`/paths/${selectedPathId}`);
    }
  }, [selectedPathId, navigate]);

  const getResourceRoute = (resource) => {
    if (!resource) return null;
    const type = (resource.type || '').toLowerCase();
    if (type.includes('study')) return `/study-notes?selected_id=${encodeURIComponent(resource.id)}`;
    if (type.includes('tutorial')) return `/tutorials?selected_id=${encodeURIComponent(resource.id)}`;
    if (type.includes('paper')) return `/past-papers?selected_id=${encodeURIComponent(resource.id)}`;
    return null;
  };

  const openResource = (resource) => {
    const url = getResourceUrl(resource);
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        if (url.startsWith(API_BASE_URL)) {
          const relative = url.slice(API_BASE_URL.length);
          navigate(relative || '/');
        } else {
          window.location.assign(url);
        }
        return;
      }
      navigate(url);
      return;
    }

    const route = getResourceRoute(resource);
    if (route) {
      navigate(route);
    }
  };

  const getMilestoneProgress = (milestones = [], pathId) => {
    let done = 0;
    milestones.forEach((m, index) => {
      if (normalizeMilestone(pathId, m, completedResourceIds, completedMilestoneIds, index)) done++;
    });
    return { done, total: milestones.length };
  };

  const startPath = async (path) => {
    if (!user?.email) return;
    try {
      await recordStudentProgress({
        student_email: user.email,
        entry_type: 'learning_path',
        resource_id: path.id,
        resource_type: 'learning_path',
        resource_title: path.title,
        subject: path.subject,
        level: path.level,
        completed: false,
        completed_at: new Date().toISOString(),
      });
      const prog = await fetchStudentProgress({ studentEmail: user.email });
      setProgress(Array.isArray(prog) ? prog : prog?.data ?? []);
    } catch (error) {
      console.error('Unable to record path start:', error);
    }
  };

  const handleViewPath = async (path) => {
    await startPath(path);
    navigate(`/paths/${encodeURIComponent(path.id)}`);
  };

  const toggleMilestone = async (path, milestone, completed, milestoneId) => {
    if (!user?.email) return;
    try {
      await recordStudentProgress({
        student_email: user.email,
        entry_type: 'learning_path_milestone',
        resource_id: milestoneId,
        resource_type: 'learning_path_milestone',
        resource_title: milestone.title,
        subject: path.subject,
        level: path.level,
        completed,
        completed_at: new Date().toISOString(),
      });
      if (!startedPathIds.has(path.id)) {
        await startPath(path);
      } else {
        const prog = await fetchStudentProgress({ studentEmail: user.email });
        setProgress(Array.isArray(prog) ? prog : prog?.data ?? []);
      }
    } catch (error) {
      console.error('Unable to update milestone completion:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this learning path?")) return;
    try {
      await deleteLearningPath(id);
      setPaths(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  if (activePath) {
    const milestones = (activePath.milestones || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    const { done, total } = getMilestoneProgress(milestones, activePath.id);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div className="w-full px-4 py-8">
        <button onClick={() => { navigate('/learning-paths'); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Learning Paths
        </button>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-orange-500 text-white shadow-2xl shadow-rose-500/20">
            <div className="p-8 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-semibold text-white/90">
                {activePath.level}
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl font-bold leading-tight tracking-tight">{activePath.title}</h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-rose-100/90">{activePath.description || `Follow this structured path to master ${activePath.subject}.`}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">Modules</p>
                  <p className="mt-2 text-2xl font-semibold">{milestones.length}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">Progress</p>
                  <p className="mt-2 text-2xl font-semibold">{pct}%</p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.5rem] bg-white/10 p-4 border border-white/15">
                <div className="flex items-center justify-between gap-4 text-sm text-white/80">
                  <div>{done}/{total} completed</div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-semibold">{activePath.subject}</div>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70">Roadmap status</p>
                  <p className="mt-1 text-sm text-white/90">{hasStartedPath(activePath, done) ? 'Keep going — you are building mastery step by step.' : 'Start the first milestone to begin your journey.'}</p>
                </div>
                <button onClick={() => startPath(activePath)}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-rose-600 shadow-lg shadow-rose-500/20 transition hover:bg-rose-50">
                  {hasStartedPath(activePath, done) ? 'Continue Path' : 'Start Path'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Learning Roadmap</h2>
                  <p className="text-sm text-muted-foreground mt-1">Complete each milestone in sequence to advance through this path.</p>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">{milestones.length} milestones</div>
              </div>

              <div className="space-y-4">
                {milestones.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No milestones added to this path yet.
                  </div>
                )}
                {milestones.map((m, i) => {
                  const ids = m.resource_ids || [];
                  const mDone = normalizeMilestone(activePath.id, m, completedResourceIds, completedMilestoneIds, i);
                  const prevDone = i === 0 || (() => {
                    const prev = milestones[i - 1];
                    const prevIds = prev?.resource_ids || [];
                    return prevIds.length === 0 || normalizeMilestone(activePath.id, prev, completedResourceIds, completedMilestoneIds, i - 1);
                  })();
                  const locked = !prevDone && i > 0;
                  const relatedResources = ids.map(id => allResourceMap.get(id)).filter(Boolean);

                  return (
                    <div key={i} className={`rounded-[1.5rem] border p-5 ${mDone ? 'border-blue-200 bg-blue-50/80' : locked ? 'border-border bg-muted/80 opacity-80' : 'border-border bg-white'} shadow-sm`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                            <span className={mDone ? 'text-blue-700' : locked ? 'text-muted-foreground' : 'text-primary'}>{locked ? 'Locked' : mDone ? 'Completed' : 'Milestone'}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                            <span>{`Step ${i + 1}`}</span>
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-foreground">{m.title || `Milestone ${i + 1}`}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-muted px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">{relatedResources.length} resource{relatedResources.length === 1 ? '' : 's'}</span>
                          <span className="text-xs text-muted-foreground">{mDone ? 'Done' : locked ? 'Wait for previous step' : 'Ready to start'}</span>
                        </div>
                      </div>
                      {m.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.description}</p>}

                      {relatedResources.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {relatedResources.map((resource) => {
                            const href = getResourceUrl(resource) || getResourceRoute(resource);
                            return (
                              <button key={resource.id} type="button" onClick={() => openResource(resource)}
                                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5">
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <p className="font-medium text-foreground">{getResourceLabel(resource)}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{resource.type || resource.subject || 'Resource'}</p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {!locked && (
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">Mark this milestone complete when you finish the assigned resources.</p>
                          <button onClick={() => toggleMilestone(activePath, m, !mDone, milestoneResourceId(activePath.id, m, i))}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mDone ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                            {mDone ? 'Mark incomplete' : 'Complete milestone'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-2xl p-3 shadow-sm shadow-primary/10">
            <MapIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-poppins text-3xl font-bold text-foreground">Learning Paths</h1>
            <p className="text-muted-foreground text-sm">Follow structured roadmaps to master each subject step by step.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${level === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={subject} onChange={e => setSubject(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs bg-muted text-foreground border border-border outline-none">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">No learning paths yet</p>
          <p className="text-sm text-muted-foreground">{isTeacher ? "Create learning paths from your Teacher Dashboard to guide students." : "Ask your teacher to create learning paths for your subjects."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(path => {
            const { done, total } = getMilestoneProgress(path.milestones, path.id);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={path.id} className="bg-card border border-border/70 rounded-[1.75rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-200 flex flex-col overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${LEVEL_COLORS[path.level] || "bg-muted"}`}>
                    {path.level}
                  </span>
                  <span className="text-xs text-muted-foreground">{done}/{total} milestones</span>
                </div>
                <div className="mb-4">
                  <h3 className="font-poppins text-lg font-semibold text-foreground mb-1 leading-snug">{path.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{path.subject}</p>
                  {path.description && <p className="text-sm text-muted-foreground line-clamp-3">{path.description}</p>}
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{pct}% complete</span>
                    <span>{done}/{total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <button onClick={() => handleViewPath(path)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                  {hasStartedPath(path, done) ? "Continue Path" : "Start Path"} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}