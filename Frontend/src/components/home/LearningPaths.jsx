import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/AuthContext";
import { fetchLearningPaths, fetchStudentProgress } from "@/api";

export default function LearningPaths() {
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [pathResults, progressResults] = await Promise.all([
          fetchLearningPaths({}),
          user ? fetchStudentProgress({ studentEmail: user.email }) : Promise.resolve([]),
        ]);

        if (!active) return;

        const learningPaths = Array.isArray(pathResults) ? pathResults : pathResults?.data ?? [];
        const studentProgress = Array.isArray(progressResults) ? progressResults : progressResults?.data ?? [];

        setPaths(learningPaths.slice(0, 3));
        setProgressData(studentProgress);
      } catch (error) {
        console.error(error);
        if (active) {
          setPaths([]);
          setProgressData([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [user]);

  const startedPathIds = new Set(progressData.filter((entry) => entry.entry_type === 'learning_path' && entry.resource_type === 'learning_path' && entry.completed !== false).map((entry) => entry.resource_id));

  const getPathMeta = (path) => {
    const milestones = Array.isArray(path.milestones) ? path.milestones : [];
    const totalSteps = milestones.length;
    const completedSteps = milestones.reduce((count, milestone) => {
      const resourceIds = Array.isArray(milestone.resource_ids) ? milestone.resource_ids : [];
      if (resourceIds.length === 0) return count;
      const completed = resourceIds.every((id) => progressData.some((progress) => progress.resource_id === id && progress.completed));
      return count + (completed ? 1 : 0);
    }, 0);

    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const currentStep = milestones.length > 0
      ? milestones[Math.min(completedSteps, milestones.length - 1)]?.title || 'Review the next milestone'
      : 'Build your first milestone';

    return { totalSteps, completedSteps, progress, currentStep, started: startedPathIds.has(path.id) };
  };

  return (
    <section className="rounded-[28px] border border-blue-800/50 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Learning Paths
          </h2>
          <p className="text-sm text-blue-100/80">Structured journeys to exam success</p>
        </div>
        <Link
          to="/learning-paths"
          className="inline-flex items-center gap-1 rounded-full border border-yellow-300 bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-blue-950 transition-all hover:gap-2 hover:bg-yellow-300"
        >
          View all paths <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading learning paths...
          </div>
        ) : paths.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No learning paths are available yet.
          </div>
        ) : (
          paths.map((path) => {
            const { totalSteps, completedSteps, progress, currentStep } = getPathMeta(path);
            return (
              <div
                key={path.id || path.title}
                className="bg-card rounded-xl border px-3.5 py-3 hover:shadow-md transition-all duration-200"
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.25fr_1fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border border-blue-200 text-blue-600">
                        {path.level || 'General'}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{totalSteps} milestones</span>
                    </div>
                    <h3 className="font-heading font-bold text-sm leading-tight line-clamp-1">{path.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      Up next: <span className="font-medium text-foreground">{currentStep}</span>
                    </p>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">{completedSteps}/{totalSteps}</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  <Link
                    to={`/paths/${encodeURIComponent(path.id)}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-blue-950 transition hover:bg-yellow-300"
                  >
                    {startedPathIds.has(path.id) || progress > 0 ? 'Continue' : 'Start'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}


