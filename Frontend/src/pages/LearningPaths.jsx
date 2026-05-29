// @ts-nocheck
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "@/lib/AuthContext";
import { fetchLearningPaths, fetchStudentProgress, fetchStudyNotes, fetchResources, deleteLearningPath, recordStudentProgress } from '@/api';
import ResourcePageHero from "@/components/ResourcePageHero";
import {
  PAGE_WRAP,
  LEVEL_INFO,
  filterButtonClass,
  YELLOW_BUTTON_CLASS,
  YELLOW_BUTTON_MD,
  CARD_CLASS,
  SPINNER_CLASS,
} from "@/lib/resourcePageStyles";
import { Map as MapIcon, ChevronRight, Sparkles } from "lucide-react";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  const [dialog, setDialog] = useState(null);
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
    setDialog({ title: "Delete learning path", message: "Are you sure you want to delete this learning path?", confirmLabel: "Delete", danger: true, onConfirm: async () => { try { await deleteLearningPath(id); await load(); } catch(e){ console.error(e); } } });
    return;
    try {
      await deleteLearningPath(id);
      setPaths(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className={`${PAGE_WRAP} flex justify-center py-24`}><div className={SPINNER_CLASS} /></div>;

  if (activePath) {
    const milestones = (activePath.milestones || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    const { done, total } = getMilestoneProgress(milestones, activePath.id);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <div className={PAGE_WRAP}>
        <button type="button" onClick={() => { navigate('/learning-paths'); }} className={`${YELLOW_BUTTON_MD} mb-6`}>
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Learning Paths
        </button>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white shadow-2xl shadow-blue-900/20">
            <div className="p-8 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-semibold text-white/90">
                {activePath.level}
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl font-bold leading-tight tracking-tight">{activePath.title}</h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-base text-blue-100/90">{activePath.description || `Follow this structured path to master ${activePath.subject}.`}</p>

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
                  <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70">Roadmap status</p>
                  <p className="mt-1 text-sm text-white/90">{hasStartedPath(activePath, done) ? 'Keep going — you are building mastery step by step.' : 'Start the first milestone to begin your journey.'}</p>
                </div>
                <button type="button" onClick={() => startPath(activePath)}
                  className="inline-flex items-center justify-center rounded-full border border-yellow-300 bg-yellow-400 px-5 py-3 text-sm font-semibold text-blue-950 shadow-lg transition hover:bg-yellow-300">
                  {hasStartedPath(activePath, done) ? 'Continue Path' : 'Start Path'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-blue-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-blue-950">Learning Roadmap</h2>
                  <p className="mt-1 text-sm text-blue-900/70">Complete each milestone in sequence to advance through this path.</p>
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-900/60">{milestones.length} milestones</div>
              </div>

              <div className="space-y-4">
                {milestones.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-blue-200 p-6 text-center text-sm text-blue-900/70">
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
                    <div key={i} className={`rounded-[1.5rem] border p-5 shadow-sm ${mDone ? 'border-yellow-300 bg-yellow-50/80' : locked ? 'border-blue-100 bg-blue-50/50 opacity-80' : 'border-blue-200 bg-white'}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-900/60">
                            <span className={mDone ? 'text-yellow-800' : locked ? 'text-blue-900/50' : 'text-blue-700'}>{locked ? 'Locked' : mDone ? 'Completed' : 'Milestone'}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                            <span>{`Step ${i + 1}`}</span>
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-blue-950">{m.title || `Milestone ${i + 1}`}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-800">{relatedResources.length} resource{relatedResources.length === 1 ? '' : 's'}</span>
                          <span className="text-xs text-blue-900/60">{mDone ? 'Done' : locked ? 'Wait for previous step' : 'Ready to start'}</span>
                        </div>
                      </div>
                      {m.description && <p className="mt-3 text-sm leading-relaxed text-blue-900/70">{m.description}</p>}

                      {relatedResources.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {relatedResources.map((resource) => {
                            const href = getResourceUrl(resource) || getResourceRoute(resource);
                            return (
                              <button key={resource.id} type="button" onClick={() => openResource(resource)}
                                className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-left transition hover:border-yellow-300 hover:bg-yellow-50">
                                <div className="flex items-center justify-between gap-4">
                                  <div>
                                    <p className="font-medium text-blue-950">{getResourceLabel(resource)}</p>
                                    <p className="mt-1 text-xs text-blue-900/60">{resource.type || resource.subject || 'Resource'}</p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-blue-400" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {!locked && (
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-xs text-blue-900/60">Mark this milestone complete when you finish the assigned resources.</p>
                          <button type="button" onClick={() => toggleMilestone(activePath, m, !mDone, milestoneResourceId(activePath.id, m, i))}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${mDone ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : `${YELLOW_BUTTON_CLASS}`}`}>
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
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={MapIcon}
        title="Learning Paths"
        subtitle="Follow structured roadmaps to master each subject step by step."
      />

      <div className="mb-3 grid w-full grid-cols-4 gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={filterButtonClass(level === l, { fullWidth: true })}
          >
            {l}
          </button>
        ))}
      </div>

      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mb-8 w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm text-blue-950 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400"
      >
        <option value="">All Subjects</option>
        {subjects.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-blue-200/80 bg-white py-20 text-center">
          <Sparkles className="mx-auto mb-3 h-12 w-12 text-blue-400" />
          <p className="mb-1 font-medium text-blue-950">No learning paths yet</p>
          <p className="text-sm text-blue-900/70">{isTeacher ? "Create learning paths from your Teacher Dashboard to guide students." : "Ask your teacher to create learning paths for your subjects."}</p>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(path => {
            const { done, total } = getMilestoneProgress(path.milestones, path.id);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={path.id} className={`${CARD_CLASS} flex flex-col p-6`}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${LEVEL_INFO[path.level]?.color || "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                    {path.level}
                  </span>
                  <span className="text-xs text-blue-900/70">{done}/{total} milestones</span>
                </div>
                <div className="mb-4">
                  <h3 className="mb-1 font-poppins text-lg font-semibold leading-snug text-blue-950">{path.title}</h3>
                  <p className="mb-2 text-xs text-blue-900/70">{path.subject}</p>
                  {path.description && <p className="line-clamp-3 text-sm text-blue-900/60">{path.description}</p>}
                </div>
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-blue-900/70">
                    <span>{pct}% complete</span>
                    <span>{done}/{total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <button type="button" onClick={() => handleViewPath(path)} className={`${YELLOW_BUTTON_CLASS} w-full gap-2 py-3`}>
                  {hasStartedPath(path, done) ? "Continue Path" : "Start Path"} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}