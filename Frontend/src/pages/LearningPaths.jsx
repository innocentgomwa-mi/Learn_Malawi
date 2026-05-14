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
    navigate(`/learning-paths?path_id=${encodeURIComponent(path.id)}`);
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

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${LEVEL_COLORS[activePath.level]}`}>{activePath.level}</span>
              <h1 className="font-poppins text-2xl font-bold text-foreground mt-2">{activePath.title}</h1>
              <p className="text-muted-foreground text-sm mt-1">{activePath.subject}</p>
              {activePath.description && <p className="text-sm text-muted-foreground mt-2">{activePath.description}</p>}
              <p className="text-xs uppercase tracking-[0.3em] font-semibold mt-3 text-primary">
                {hasStartedPath(activePath, done) ? 'Path started' : 'Not started yet'}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-poppins font-bold text-sm text-foreground">{pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{done}/{total} done</p>
            </div>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 mb-6">
            Milestones are fixed learning checkpoints. Mark each one complete when you finish it, and your progress will be stored.
          </div>
        </div>

        {/* Roadmap */}
        <div className="space-y-2">
          {milestones.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No milestones added to this path yet.</p>
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
              <div key={i} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${mDone ? "bg-primary border-primary text-primary-foreground" : locked ? "bg-muted border-border text-muted-foreground" : "bg-card border-primary text-primary"}`}>
                    {mDone ? <CheckCircle className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : <Circle className="h-5 w-5" />}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 ${mDone ? "bg-primary" : "bg-border"}`} style={{ minHeight: 32 }} />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 bg-card border rounded-2xl p-4 mb-2 ${mDone ? "border-primary/30" : locked ? "border-border opacity-60" : "border-primary/20"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{m.title || `Milestone ${i + 1}`}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mDone ? "bg-sky-100 text-sky-700" : locked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                      {mDone ? "Completed" : locked ? "Locked" : "In Progress"}
                    </span>
                  </div>
                  {m.description && <p className="text-sm text-muted-foreground mb-2">{m.description}</p>}
                  {relatedResources.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-foreground mb-1">Assigned resources</div>
                      <div className="space-y-2">
                        {relatedResources.map((resource) => {
                          const href = getResourceUrl(resource) || getResourceRoute(resource);
                          return (
                            <div key={resource.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              {completedResourceIds.has(resource.id) ? <CheckCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" /> : <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />}
                              <span className={completedResourceIds.has(resource.id) ? "line-through" : ""}>{getResourceLabel(resource)}</span>
                              <div className="ml-auto flex items-center gap-2">
                                {href && (
                                  <button type="button" onClick={() => openResource(resource)}
                                    className="text-[10px] font-semibold text-primary hover:underline">
                                    Open
                                  </button>
                                )}
                                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{resource.type || resource.subject || ''}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {!locked && (
                    <div className="space-y-2">
                      {relatedResources.length > 0 ? (
                        <p className="text-xs text-muted-foreground">Open the assigned resources and mark this milestone complete when you finish them.</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">This milestone has no assigned resources yet. Mark it complete once you finish the topic.</p>
                      )}
                      <button onClick={() => toggleMilestone(activePath, m, !mDone, milestoneResourceId(activePath.id, m, i))}
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${mDone ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                        {mDone ? 'Mark milestone incomplete' : 'Mark milestone complete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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