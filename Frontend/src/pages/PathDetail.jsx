// @ts-nocheck
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, BookOpen, Zap, CheckCircle, Lock, Play } from "lucide-react";
import { motion } from "framer-motion";
import { fetchLearningPath, fetchStudyNotes, fetchResources, fetchQuizzes, fetchStudentProgress, recordStudentProgress } from '@/api';

const categoryGradients = {
  web_development: "from-blue-500 to-indigo-600",
  data_science: "from-emerald-500 to-teal-600",
  cybersecurity: "from-red-500 to-rose-600",
  cloud_computing: "from-sky-500 to-cyan-600",
  mobile_development: "from-violet-500 to-purple-600",
  devops: "from-orange-500 to-amber-600",
  ai_ml: "from-pink-500 to-fuchsia-600",
  general: "from-slate-500 to-gray-600",
};

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

const getResourceUrl = (resource) => {
  if (!resource) return null;
  const rawUrl = resource.url || resource.fileUrl || resource.videoUrl || resource.paperUrl;
  if (!rawUrl) return null;
  return rawUrl;
};

const getResourceLabel = (resource) => resource?.label || resource?.title || resource?.name || 'Resource';

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
    [...studyNotes, ...resources, ...quizzes].forEach((item) => {
      if (item?.id) map.set(item.id, item);
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
      <div className="p-6 lg:p-10 max-w-4xl space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <p className="text-muted-foreground">Path not found</p>
        <Button variant="outline" onClick={() => navigate("/paths")} className="mt-4">
          Back to Paths
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/paths")}
        className="mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Paths
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${categoryGradients[path.category] || categoryGradients.general} rounded-2xl p-8 text-white relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-3">
            {(path.category || "general").replace(/_/g, " ")}
          </Badge>
          <h1 className="text-2xl lg:text-3xl font-bold">{path.title}</h1>
          <p className="text-white/80 mt-2 max-w-xl">{path.description || `Follow this structured path to master ${path.subject}.`}</p>
          <div className="flex items-center gap-6 mt-5 text-sm text-white/70">
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
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>{completedCount}/{sortedMilestones.length} completed</span>
                <span className="font-semibold text-white">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
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
            className="bg-card rounded-2xl border border-border p-8 text-center"
          >
            <h3 className="text-lg font-semibold text-foreground">Ready to start learning?</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Enroll in this path to begin your personalized learning journey.
            </p>
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.status === 'loading'}
              className="mt-5"
              size="lg"
            >
              {enrollMutation.status === 'loading' ? "Enrolling..." : "Start This Path"}
            </Button>
          </motion.div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Learning Roadmap</h3>
                <p className="text-sm text-muted-foreground mt-1">Complete each milestone in sequence to advance through this path.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">{sortedMilestones.length} milestones</span>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-white/80 p-6">
              <div className="pointer-events-none absolute inset-y-0 left-11 w-px bg-slate-200" />
              {sortedMilestones.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No milestones added to this path yet.
                </div>
              )}
            <div className="space-y-8">
                {sortedMilestones.map((milestone, index) => {
                  const milestoneId = milestoneResourceId(pathId, milestone, index);
                  const status = getMilestoneStatus(index);
                  const resourceItems = (milestone.resource_ids || []).map((id) => resourceMap.get(id)).filter(Boolean);
                  const isQuiz = resourceItems.some((resource) => (resource.type || '').toLowerCase() === 'quiz');
                  const typeLabel = isQuiz ? 'Quiz' : 'Lesson';
                  const statusIcon = status === 'completed' ? <CheckCircle className="h-4 w-4" /> : status === 'locked' ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4" />;

                  return (
                    <div key={milestoneId} className="relative flex gap-5">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full border ${status === 'completed' ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : status === 'locked' ? 'border-slate-300 bg-slate-100 text-slate-500' : 'border-primary bg-primary/10 text-primary'}`}>
                          {statusIcon}
                        </div>
                        {index < sortedMilestones.length - 1 && (
                          <div className="mt-2 h-full w-px bg-slate-200" />
                        )}
                      </div>

                      <div className="flex-1 rounded-[2rem] border border-border bg-slate-50 p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.22em] font-semibold text-slate-600">
                              <BookOpen className="h-3.5 w-3.5" />
                              {typeLabel}
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-foreground">{milestone.title || `Milestone ${index + 1}`}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">{milestone.description || 'Complete the next module to continue the path.'}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            {typeof milestone.points === 'number' && milestone.points > 0 && (
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">+{milestone.points} XP</span>
                            )}
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${status === 'completed' ? 'bg-emerald-100 text-emerald-700' : status === 'locked' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
                              {status === 'completed' ? 'Completed' : status === 'locked' ? 'Locked' : 'Available'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-muted-foreground">
                            {resourceItems.length} resource{resourceItems.length === 1 ? '' : 's'} · Step {index + 1} of {sortedMilestones.length}
                          </p>
                          <Button
                            onClick={() => navigate(`/paths/${pathId}/module/${milestoneId}`)}
                            variant={status === 'locked' ? 'secondary' : 'default'}
                            size="sm"
                            disabled={status === 'locked'}
                          >
                            View module
                          </Button>
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
