import React from "react";
import { ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PATHS = [
  {
    title: "MSCE Mathematics Master",
    description: "From algebra to calculus — a complete MSCE maths preparation path.",
    level: "MSCE",
    progress: 38,
    totalSteps: 12,
    completedSteps: 4,
    badge: "Recommended",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    color: "bg-blue-500",
    currentStep: "Calculus Introduction",
  },
  {
    title: "MSCE Sciences Bundle",
    description: "Tackle Biology, Chemistry, and Physics in one structured path.",
    level: "MSCE",
    progress: 20,
    totalSteps: 15,
    completedSteps: 3,
    badge: "Popular",
    badgeColor: "bg-green-500/10 text-green-600 border-green-200",
    color: "bg-green-500",
    currentStep: "Organic Chemistry",
  },
  {
    title: "JCE English Excellence",
    description: "Build strong essay writing, comprehension, and language skills.",
    level: "JCE",
    progress: 0,
    totalSteps: 8,
    completedSteps: 0,
    badge: "New",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    color: "bg-purple-500",
    currentStep: "Grammar & Sentence Structure",
  },
];

export default function LearningPaths() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Learning Paths
          </h2>
          <p className="text-sm text-muted-foreground">Structured journeys to exam success</p>
        </div>
        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
          All paths <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PATHS.map((path) => (
          <div key={path.title} className="bg-card rounded-xl border p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${path.badgeColor}`}>{path.badge}</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{path.level}</Badge>
                </div>
                <h3 className="font-heading font-bold text-base">{path.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{path.description}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{path.completedSteps}/{path.totalSteps} steps</span>
                <span className="font-semibold">{path.progress}%</span>
              </div>
              <Progress value={path.progress} className="h-1.5" />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              {path.progress > 0
                ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                : <Circle className="h-3.5 w-3.5 shrink-0" />
              }
              <span>Up next: <span className="font-medium text-foreground">{path.currentStep}</span></span>
            </div>

            <Button size="sm" variant={path.progress > 0 ? "default" : "outline"} className="w-full text-xs h-8">
              {path.progress > 0 ? "Continue Path" : "Start Path"}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}