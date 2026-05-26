import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
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
    <section className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Learning Paths
          </h2>
          <p className="text-sm text-muted-foreground">Structured journeys to exam success</p>
        </div>
        <Link
          to="/learning-paths"
          className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all paths <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                className="bg-card rounded-xl border p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border border-blue-200 text-blue-600">
                        {path.level || 'General'}
                      </Badge>
                    </div>
                    <h3 className="font-heading font-bold text-base">{path.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {path.description || 'A guided path curated for you.'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{completedSteps}/{totalSteps} milestones</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  {progress > 0 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>
                    Up next: <span className="font-medium text-foreground">{currentStep}</span>
                  </span>
                </div>

                <Link
                  to={`/paths/${encodeURIComponent(path.id)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  {startedPathIds.has(path.id) || progress > 0 ? 'Continue Path' : 'Start Path'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}


