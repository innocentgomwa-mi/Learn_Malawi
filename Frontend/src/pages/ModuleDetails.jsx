// @ts-nocheck
import { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { fetchLearningPath, fetchStudyNotes, fetchResources, fetchQuizzes, fetchStudentProgress, recordStudentProgress } from '@/api';

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

const getResourceLabel = (resource) => resource?.label || resource?.title || resource?.name || 'Resource';

export default function ModuleDetails() {
  const { pathId, moduleId } = useParams();
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

  const milestoneIndex = useMemo(() => {
    return sortedMilestones.findIndex((milestone, index) => milestoneResourceId(pathId, milestone, index) === moduleId);
  }, [sortedMilestones, pathId, moduleId]);

  const milestone = sortedMilestones[milestoneIndex];

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

  const currentMilestoneKey = milestone ? milestoneResourceId(pathId, milestone, milestoneIndex) : null;
  const currentProgress = currentMilestoneKey ? progressMap.get(currentMilestoneKey) : null;

  const previousCompleted = milestoneIndex <= 0 || (() => {
    const previous = sortedMilestones[milestoneIndex - 1];
    const previousKey = milestoneResourceId(pathId, previous, milestoneIndex - 1);
    const previousProgress = progressMap.get(previousKey);
    return previousProgress?.completed === true;
  })();

  const status = !milestone
    ? 'missing'
    : !previousCompleted
      ? 'locked'
      : currentProgress?.completed
        ? 'completed'
        : 'unlocked';

  const resourceItems = useMemo(() => {
    if (!milestone?.resource_ids) return [];
    return milestone.resource_ids
      .map((resourceId) => resourceMap.get(resourceId))
      .filter(Boolean);
  }, [milestone, resourceMap]);

  const quizResource = resourceItems.find((resource) => (resource.type || '').toLowerCase() === 'quiz');
  const quizRoute = quizResource ? getResourceRoute(quizResource) : null;
  const quizProgress = quizResource ? progress.find((entry) => entry.entry_type === 'quiz' && entry.quiz_id === quizResource.id) : null;
  const passThreshold = !quizResource || (quizProgress?.completed && (quizProgress.score ?? 0) >= 70);

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email || !path || !milestone) return;
      const operations = [];
      const milestonePoints = typeof milestone.points === 'number' ? milestone.points : 0;

      operations.push(recordStudentProgress({
        student_email: user.email,
        entry_type: 'learning_path_milestone',
        resource_id: currentMilestoneKey,
        resource_type: 'learning_path_milestone',
        resource_title: milestone.title,
        subject: path.subject,
        level: path.level,
        completed: true,
        points: milestonePoints,
        score: quizProgress?.score,
        total_questions: quizProgress?.total_questions,
        correct_answers: quizProgress?.correct_answers,
        completed_at: new Date().toISOString(),
      }));

      if (!pathStarted) {
        operations.push(recordStudentProgress({
          student_email: user.email,
          entry_type: 'learning_path',
          resource_id: pathId,
          resource_type: 'learning_path',
          resource_title: path.title,
          subject: path.subject,
          level: path.level,
          completed: false,
          completed_at: new Date().toISOString(),
        }));
      }

      const nextMilestone = sortedMilestones[milestoneIndex + 1];
      if (passThreshold && nextMilestone) {
        operations.push(recordStudentProgress({
          student_email: user.email,
          entry_type: 'learning_path_milestone',
          resource_id: milestoneResourceId(pathId, nextMilestone, milestoneIndex + 1),
          resource_type: 'learning_path_milestone',
          resource_title: nextMilestone.title,
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

  useEffect(() => {
    if (!user?.email || !path || !milestone) return;
    if (status !== 'unlocked') return;
    if (currentProgress?.completed) return;
    if (!passThreshold) return;
    if (completeMutation.isLoading || completeMutation.isSuccess) return;
    completeMutation.mutate();
  }, [user?.email, path, milestone, status, currentProgress?.completed, passThreshold, completeMutation.isLoading, completeMutation.isSuccess]);

  const isLoading = pathLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl space-y-6">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!path || !milestone) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <p className="text-muted-foreground">Module not found</p>
        <Button variant="outline" onClick={() => navigate(`/paths/${pathId}`)} className="mt-4">
          Back to roadmap
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/paths/${pathId}`)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{path.title}</p>
          <h1 className="text-3xl font-bold text-foreground">{milestone.title}</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-card border border-border p-8"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className={status === 'locked' ? 'bg-muted text-muted-foreground' : status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-primary-foreground'}>
              {status === 'locked' ? 'Locked' : status === 'completed' ? 'Completed' : 'Unlocked'}
            </Badge>
            <p className="text-sm text-muted-foreground">{milestone.description || 'Complete the assigned resources to progress through this module.'}</p>
            {typeof milestone.points === 'number' && milestone.points > 0 && (
              <p className="text-sm text-emerald-700">Complete this activity to earn {milestone.points} point{milestone.points === 1 ? '' : 's'}.</p>
            )}
          </div>
          <div className="rounded-3xl bg-muted p-4 text-sm text-muted-foreground border border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{resourceItems.length} assigned resource{resourceItems.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-2 text-xs">{milestoneIndex + 1} of {sortedMilestones.length}</div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Module overview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{milestone.description || 'This activity is tracked automatically when you open the module and satisfy any quiz requirement.'}</p>
          </div>

          {resourceItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-6 text-sm text-muted-foreground">
              No assigned resources yet for this module.
            </div>
          ) : (
            <div className="grid gap-4">
              {resourceItems.map((resource) => {
                const route = getResourceRoute(resource);
                return (
                  <div key={resource.id} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Circle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{getResourceLabel(resource)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{resource.type || resource.subject || 'Resource'}</p>
                      </div>
                      {route && (
                        <Button size="sm" variant="outline" onClick={() => navigate(route)}>
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {quizResource && (
            <div className="rounded-3xl border border-border bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Quiz requirement</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete this quiz to validate your readiness for the next module.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => quizRoute && navigate(quizRoute)}>
                  Open quiz
                </Button>
              </div>
              {quizProgress ? (
                <p className="mt-3 text-sm text-muted-foreground">Latest quiz score: {quizProgress.score ?? 'N/A'}%</p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No quiz attempt recorded yet.</p>
              )}
              {quizProgress?.completed && quizProgress.score != null && quizProgress.score < 70 && (
                <p className="mt-3 text-sm text-amber-700">Your score is below the mastery threshold. Retry the quiz before progressing.</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {status === 'locked'
                ? 'This module is locked until the previous step is completed.'
                : status === 'completed'
                  ? 'This module is already complete. Return to the roadmap to continue.'
                  : 'This activity is tracked automatically once the module is opened and any quiz is passed.'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
