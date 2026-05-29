// @ts-nocheck
import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Circle, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { fetchLearningPath, fetchStudyNotes, fetchResources, fetchQuizzes, fetchStudentProgress, recordStudentProgress } from '@/api';
import {
  PAGE_WRAP,
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

const getResourceLabel = (resource) => resource?.label || resource?.title || resource?.name || 'Resource';

export default function ModuleDetails() {
  const { pathId, moduleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

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
      .map((resourceId) => resourceMap.get(String(resourceId)))
      .filter(Boolean);
  }, [milestone, resourceMap]);

  const quizResource = resourceItems.find((resource) => (resource.type || '').toLowerCase() === 'quiz');
  const quizRoute = quizResource ? getResourceRoute(quizResource) : null;
  const quizProgress = quizResource ? progress.find((entry) => entry.entry_type === 'quiz' && String(entry.quiz_id) === String(quizResource.id)) : null;
  const passThreshold = !quizResource || (quizProgress?.completed && (quizProgress.score ?? 0) >= 70);

  useEffect(() => {
    // Reset quiz UI when module changes
    setQuizOpen(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizSubmitting(false);
  }, [pathId, moduleId]);

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
      <div className={`${PAGE_WRAP} mx-auto max-w-4xl space-y-6`}>
        <Skeleton className="h-28 rounded-2xl bg-blue-100" />
        <Skeleton className="h-72 rounded-2xl bg-blue-50" />
      </div>
    );
  }

  if (!path || !milestone) {
    return (
      <div className={`${PAGE_WRAP} mx-auto max-w-4xl py-20 text-center`}>
        <p className="text-blue-900/70">Module not found</p>
        <button type="button" onClick={() => navigate(`/paths/${pathId}`)} className={`${OUTLINE_BUTTON_CLASS} mt-4`}>
          Back to roadmap
        </button>
      </div>
    );
  }

  const statusBadgeClass =
    status === 'locked'
      ? 'bg-blue-50 text-blue-600 border border-blue-200'
      : status === 'completed'
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        : 'bg-yellow-400 text-blue-950 border border-yellow-300';

  return (
    <div className={`${PAGE_WRAP} mx-auto max-w-4xl`}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => navigate(`/paths/${pathId}`)} className={YELLOW_BUTTON_MD}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-blue-900/60">{path.title}</p>
          <h1 className="text-3xl font-bold text-blue-950">{milestone.title}</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-blue-200/80 bg-white p-8 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge className={statusBadgeClass}>
              {status === 'locked' ? 'Locked' : status === 'completed' ? 'Completed' : 'Unlocked'}
            </Badge>
            <p className="text-sm text-blue-900/70">{milestone.description || 'Complete the assigned resources to progress through this module.'}</p>
            {typeof milestone.points === 'number' && milestone.points > 0 && (
              <p className="text-sm text-yellow-800">Complete this activity to earn {milestone.points} point{milestone.points === 1 ? '' : 's'}.</p>
            )}
          </div>
          <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-900/70">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-700" />
              <span>{resourceItems.length} assigned resource{resourceItems.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-2 text-xs">{milestoneIndex + 1} of {sortedMilestones.length}</div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-950">Module overview</h2>
            <p className="text-sm leading-relaxed text-blue-900/70">{milestone.description || 'This activity is tracked automatically when you open the module and satisfy any quiz requirement.'}</p>
          </div>

          {resourceItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/30 p-6 text-sm text-blue-900/70">
              No assigned resources yet for this module.
            </div>
          ) : (
            <div className="grid gap-4">
              {resourceItems.map((resource) => {
                const route = getResourceRoute(resource);
                const isQuizItem = (resource.type || '').toLowerCase() === 'quiz';
                return (
                  <div key={resource.id} className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm transition hover:border-yellow-300">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700">
                        <Circle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-blue-950">{getResourceLabel(resource)}</p>
                        <p className="mt-1 text-xs text-blue-900/60">{resource.type || resource.subject || 'Resource'}</p>
                      </div>
                      {route && !isQuizItem && (
                        <button type="button" onClick={() => navigate(route)} className={YELLOW_BUTTON_CLASS + " shrink-0 px-3 py-1.5 text-xs"}>
                          Open
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {quizResource && (
            <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-950">Quiz requirement</p>
                  <p className="mt-1 text-xs text-blue-900/70">Complete this quiz to validate your readiness for the next module.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuizOpen((v) => !v)}
                  className={YELLOW_BUTTON_CLASS + " px-3 py-1.5 text-xs"}
                >
                  {quizOpen ? <><ChevronUp className="h-4 w-4" /> Hide quiz</> : <><ChevronDown className="h-4 w-4" /> Open quiz</>}
                </button>
              </div>
              {quizProgress ? (
                <p className="mt-3 text-sm text-blue-900/70">Latest quiz score: {quizProgress.score ?? 'N/A'}%</p>
              ) : (
                <p className="mt-3 text-sm text-blue-900/70">No quiz attempt recorded yet.</p>
              )}
              {quizProgress?.completed && quizProgress.score != null && quizProgress.score < 70 && (
                <p className="mt-3 text-sm text-amber-700">Your score is below the mastery threshold. Retry the quiz before progressing.</p>
              )}

              {quizOpen && (
                <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-950">{quizResource.title || 'Quiz'}</p>
                      <p className="text-xs text-blue-900/60">{quizResource.subject || ''}</p>
                    </div>
                    <div className="text-xs font-semibold text-blue-900/70">
                      {(quizResource.questions || []).length} questions
                    </div>
                  </div>

                  {(quizResource.questions || []).length === 0 ? (
                    <p className="text-sm text-blue-900/70">This quiz has no questions yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {(quizResource.questions || []).map((q, i) => {
                        const correct = q.correctAnswer || q.answer;
                        const selected = quizAnswers[i] || "";
                        return (
                          <div key={i} className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                            <p className="mb-3 text-sm font-medium text-blue-950">{i + 1}. {q.question}</p>
                            <div className="space-y-2">
                              {(q.options || []).map((opt, j) => {
                                const optLabel = String.fromCharCode(65 + j);
                                const isSelected = String(selected).trim().charAt(0).toUpperCase() === optLabel;
                                const isCorrectOpt = String(correct || "").trim().charAt(0).toUpperCase() === optLabel;

                                let cls = "w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-all ";
                                if (!quizSubmitted) {
                                  cls += isSelected
                                    ? "border-yellow-400 bg-yellow-100/80 text-blue-950"
                                    : "border-blue-100 bg-white hover:bg-blue-50";
                                } else if (isCorrectOpt) {
                                  cls += "border-yellow-400 bg-yellow-50 text-yellow-800";
                                } else if (isSelected && !isCorrectOpt) {
                                  cls += "border-red-400 bg-red-50 text-red-800";
                                } else {
                                  cls += "border-blue-100 bg-white text-blue-900/60";
                                }

                                return (
                                  <button
                                    key={j}
                                    type="button"
                                    disabled={quizSubmitted}
                                    onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: optLabel }))}
                                    className={cls}
                                  >
                                    <span className="mr-1 font-medium">{optLabel}.</span> {String(opt).replace(/^[A-D]\)\s*/, "")}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                        {quizSubmitted ? (
                          <div className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-800">
                            <Trophy className="h-4 w-4" /> Submitted
                          </div>
                        ) : (
                          <div className="text-xs text-blue-900/60">
                            Answer all questions then submit to unlock the next module.
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={quizSubmitting || quizSubmitted || Object.keys(quizAnswers).length < (quizResource.questions || []).length}
                          onClick={async () => {
                            if (!user?.email) return;
                            setQuizSubmitting(true);
                            setQuizSubmitted(true);
                            try {
                              const questions = quizResource.questions || [];
                              let correctAnswers = 0;
                              const topicsFailed = [];
                              questions.forEach((q, idx) => {
                                const correct = q.correctAnswer || q.answer;
                                const picked = (quizAnswers[idx] || "").trim().charAt(0).toUpperCase();
                                const correctLabel = (correct || "").trim().charAt(0).toUpperCase();
                                const ok = picked && correctLabel && picked === correctLabel;
                                if (ok) correctAnswers += 1;
                                if (!ok) topicsFailed.push(String(q.question || "").slice(0, 80));
                              });
                              const scorePct = questions.length ? Math.round((correctAnswers / questions.length) * 100) : 0;

                              await recordStudentProgress({
                                student_email: user.email,
                                entry_type: 'quiz',
                                quiz_id: String(quizResource.id),
                                quiz_title: quizResource.title,
                                subject: quizResource.subject || path?.subject,
                                level: quizResource.level || path?.level,
                                completed: true,
                                score: scorePct,
                                total_questions: questions.length,
                                correct_answers: correctAnswers,
                                topics_failed: topicsFailed.slice(0, 5),
                                completed_at: new Date().toISOString(),
                              });

                              await queryClient.invalidateQueries({ queryKey: ["userProgress", pathId, user?.email] });
                            } finally {
                              setQuizSubmitting(false);
                            }
                          }}
                          className={YELLOW_BUTTON_CLASS + " px-4 py-2 text-sm disabled:opacity-50"}
                        >
                          {quizSubmitting ? "Submitting..." : quizSubmitted ? "Submitted" : "Submit quiz"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-blue-900/70">
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
