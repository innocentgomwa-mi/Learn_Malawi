// @ts-nocheck
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, BookOpen, Zap, CheckCircle, Lock, Play } from "lucide-react";
import { motion } from "framer-motion";
import { fetchLearningPath, fetchStudyNotes, fetchResources, fetchQuizzes, fetchStudentProgress, recordStudentProgress } from '@/api';
import {
  PAGE_WRAP,
  LEVEL_INFO,
  YELLOW_BUTTON_CLASS,
  YELLOW_BUTTON_MD,
  OUTLINE_BUTTON_CLASS,
} from "@/lib/resourcePageStyles";

const milestoneResourceId = (pathId, milestone, index) => milestone?.id || `${pathId}-milestone-${index}`;

const getResourceRoute = (resource) => {
  if (!resource) return null;
  const type = (resource.type || '').toLowerCase();
  if (type.includes('study')) return `/study-notes?selected_id=${encodeURIComponent(resource.id)}`;
  if (type.includes('tutorial')) return `/tutorials?selected_id=${encodeURIComponent(resource.id)}`;
  if (type.includes('paper')) return `/past-papers?selected_id=${encodeURIComponent(resource.id)}`;
  if (type === 'quiz') return `/quizzes?selected_id=${encodeURIComponent(resource.id)}`;
  return null;
};

export default function PathDetail() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: path, isLoading: pathLoading } = useQuery({
    queryKey: ["learningPath", pathId],
    queryFn: () => fetchLearningPath(pathId),
    enabled: !!pathId,
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress", pathId, user?.email],
    queryFn: () => fetchStudentProgress({ studentEmail: user?.email }),
    enabled: !!user?.email,
  });

  const { data: studyNotes = [] } = useQuery({
    queryKey: ["studyNotes"],
    queryFn: () => fetchStudyNotes({}),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: () => fetchResources(),
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => fetchQuizzes(),
  });

  const resourceMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(studyNotes) ? studyNotes : []).forEach((item) => {
      if (item?.id == null) return;
      map.set(String(item.id), item);
    });
    (Array.isArray(resources) ? resources : []).forEach((item) => {
      if (item?.id == null) return;
      map.set(String(item.id), item);
    });
    (Array.isArray(quizzes) ? quizzes : []).forEach((item) => {
      if (item?.id == null) return;
      map.set(String(item.id), { ...item, type: 'quiz' });
    });
    return map;
  }, [studyNotes, resources, quizzes]);

  const sortedMilestones = useMemo(() => {
    if (!path?.milestones) return [];
    return [...path.milestones].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [path]);

  const progressMap = useMemo(() => {
    const map = new Map();
    progress.forEach((entry) => {
      if (entry.entry_type === 'learning_path_milestone' && entry.resource_id) {
        map.set(entry.resource_id, entry);
      }
    });
    return map;
  }, [progress]);

  const pathStarted = progress.some((entry) => entry.entry_type === 'learning_path' && entry.resource_id === pathId);

  const getMilestoneStatus = (index) => {
    const milestone = sortedMilestones[index];
    const milestoneKey = milestoneResourceId(pathId, milestone, index);
    const milestoneProgress = progressMap.get(milestoneKey);
    if (milestoneProgress?.completed) return 'completed';

    if (index === 0) {
      return 'unlocked';
    }

    const prevMilestone = sortedMilestones[index - 1];
    const prevKey = milestoneResourceId(pathId, prevMilestone, index - 1);
    const prevProgress = progressMap.get(prevKey);
    return prevProgress?.completed ? 'unlocked' : 'locked';
  };

  const completedCount = sortedMilestones.filter((_, index) => getMilestoneStatus(index) === 'completed').length;
  const totalModules = Math.max(sortedMilestones.length, 1);
  const progressPercent = Math.round((completedCount / totalModules) * 100);
  const totalPoints = progress.reduce((sum, entry) => sum + (entry.points || 0), 0);
  const isLoading = pathLoading || progressLoading;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email || !path) return;
      const operations = [];
      operations.push(recordStudentProgress({
        student_email: user.email,
        entry_type: 'learning_path',
        resource_id: path.id,
        resource_type: 'learning_path',
        resource_title: path.title,
        subject: path.subject,
        level: path.level,
        completed: false,
        completed_at: new Date().toISOString(),
      }));

      if (sortedMilestones.length > 0) {
        operations.push(recordStudentProgress({
          student_email: user.email,
          entry_type: 'learning_path_milestone',
          resource_id: milestoneResourceId(path.id, sortedMilestones[0], 0),
          resource_type: 'learning_path_milestone',
          resource_title: sortedMilestones[0].title,
          subject: path.subject,
          level: path.level,
          completed: false,
          completed_at: new Date().toISOString(),
        }));
      }

      await Promise.all(operations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress", pathId, user?.email] });
    },
  });

  if (isLoading) {
    return (
      <div className={`${PAGE_WRAP} mx-auto max-w-4xl space-y-6`}>
        <Skeleton className="h-48 rounded-2xl bg-blue-100" />
        <Skeleton className="h-96 rounded-2xl bg-blue-50" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className={`${PAGE_WRAP} mx-auto max-w-4xl py-20 text-center`}>
        <p className="text-blue-900/70">Path not found</p>
        <button type="button" onClick={() => navigate("/paths")} className={`${OUTLINE_BUTTON_CLASS} mt-4`}>
          Back to Paths
        </button>
      </div>
    );
  }

  const levelBadge = LEVEL_INFO[path.level]?.color || "bg-white/20 text-white border border-white/30";

  return (
    <div className={`${PAGE_WRAP} mx-auto max-w-4xl`}>
      <button type="button" onClick={() => navigate("/paths")} className={`${YELLOW_BUTTON_MD} mb-4`}>
        <ArrowLeft className="h-4 w-4" /> Back to Paths
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-8 text-white shadow-2xl shadow-blue-900/20"
      >
        <div className="relative z-10">
          <Badge className={`mb-3 backdrop-blur-sm ${levelBadge}`}>
            {path.level || path.subject || "Learning path"}
          </Badge>
          <h1 className="text-2xl font-bold lg:text-3xl">{path.title}</h1>
          <p className="mt-2 max-w-xl text-blue-100/90">{path.description || `Follow this structured path to master ${path.subject}.`}</p>
          <div className="mt-5 flex flex-wrap items-center gap-6 text-sm text-blue-100/80">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> {sortedMilestones.length} modules
            </span>
            {path.estimated_hours && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {path.estimated_hours}h
              </span>
            )}
            {totalPoints > 0 && (
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> {totalPoints} points available
              </span>
            )}
          </div>
          {pathStarted && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-sm text-blue-100/90">
                <span>{completedCount}/{sortedMilestones.length} completed</span>
                <span className="font-semibold text-yellow-300">{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="mt-8">
        {!pathStarted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-blue-200/80 bg-white p-8 text-center"
          >
            <h3 className="text-lg font-semibold text-blue-950">Ready to start learning?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-blue-900/70">
              Enroll in this path to begin your personalized learning journey.
            </p>
            <button
              type="button"
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.status === 'loading'}
              className={`${YELLOW_BUTTON_CLASS} mt-5 px-6 py-3 text-base disabled:opacity-60`}
            >
              {enrollMutation.status === 'loading' ? "Enrolling..." : "Start This Path"}
            </button>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-blue-200/70 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-950">Learning Roadmap</h3>
                <p className="mt-1 text-sm text-blue-900/70">Complete each milestone in sequence to advance through this path.</p>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">
                {sortedMilestones.length} milestones
              </span>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="pointer-events-none absolute inset-y-0 left-[39px] w-px bg-slate-300/70" />
              {sortedMilestones.length === 0 && (
                <div className="rounded-2xl border border-dashed border-blue-200 p-6 text-center text-sm text-blue-900/70">
                  No milestones added to this path yet.
                </div>
              )}
            <div className="space-y-5">
                {sortedMilestones.map((milestone, index) => {
                  const milestoneId = milestoneResourceId(pathId, milestone, index);
                  const status = getMilestoneStatus(index);
                  const resourceItems = (milestone.resource_ids || [])
                    .map((id) => resourceMap.get(String(id)))
                    .filter(Boolean);
                  const isQuiz = resourceItems.some((resource) => (resource.type || '').toLowerCase() === 'quiz');
                  const typeLabel = isQuiz ? 'Quiz' : 'Lesson';
                  const statusIcon = status === 'completed' ? <CheckCircle className="h-4 w-4" /> : status === 'locked' ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4" />;

                  return (
                    <div key={milestoneId} className="relative flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${status === 'completed' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : status === 'locked' ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-blue-300 bg-blue-100 text-blue-800'}`}>
                          {statusIcon}
                        </div>
                        {index < sortedMilestones.length - 1 && (
                          <div className="mt-2 h-full w-px bg-slate-300/70" />
                        )}
                      </div>

                      <div className={`flex-1 rounded-2xl border p-5 shadow-sm transition-all ${status === 'locked' ? 'border-slate-200 bg-slate-50/60' : 'border-slate-200 bg-white hover:shadow-md'}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-700">
                              <BookOpen className="h-3.5 w-3.5" />
                              {typeLabel}
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-slate-900">{milestone.title || `Milestone ${index + 1}`}</h3>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Step {index + 1} of {sortedMilestones.length}</p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{milestone.description || 'Complete the next module to continue the path.'}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            {typeof milestone.points === 'number' && milestone.points > 0 && (
                              <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-yellow-800">+{milestone.points} XP</span>
                            )}
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${status === 'completed' ? 'bg-yellow-100 text-yellow-800' : status === 'locked' ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-800'}`}>
                              {status === 'completed' ? 'Completed' : status === 'locked' ? 'Locked' : 'Available'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-slate-500">
                            {resourceItems.length} resource{resourceItems.length === 1 ? '' : 's'} in this module
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate(`/paths/${pathId}/module/${milestoneId}`)}
                            disabled={status === 'locked'}
                            className={status === 'locked' ? `${OUTLINE_BUTTON_CLASS} opacity-50 cursor-not-allowed` : `${YELLOW_BUTTON_CLASS} px-4 py-2 text-sm`}
                          >
                            View module
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
