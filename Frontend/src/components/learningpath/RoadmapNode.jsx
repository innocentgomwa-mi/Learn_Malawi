import { Lock, CheckCircle2, Play, RotateCcw, BookOpen, HelpCircle, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/** @type {{ [key: string]: typeof BookOpen }} */
const typeIcons = {
  lesson: BookOpen,
  quiz: HelpCircle,
  project: Code,
  revision: RotateCcw,
};

/**
 * @typedef {{ content_type?: string; title?: string; description?: string; xp_reward?: number; estimated_minutes?: number }} RoadmapModule
 * @typedef {{ module: RoadmapModule; status?: string; score?: number; index?: number; onClick?: (module: RoadmapModule) => void }} RoadmapNodeProps
 */

/** @param {RoadmapNodeProps} props */
export default function RoadmapNode({ module, status, score, index, onClick }) {
  const typeKey = module.content_type && module.content_type in typeIcons ? module.content_type : "lesson";
  const Icon = typeIcons[typeKey];
  const isCompleted = status === "completed";
  const isLocked = status === "locked";
  const isActive = status === "unlocked" || status === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-start gap-4"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => !isLocked && onClick?.(module)}
          disabled={isLocked}
          className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 border-2",
            isCompleted && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25",
            isActive && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer hover:scale-105",
            isLocked && "bg-muted border-border text-muted-foreground cursor-not-allowed"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : isLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>
        <div className={cn(
          "w-0.5 h-8 mt-1",
          isCompleted ? "bg-emerald-300" : "bg-border"
        )} />
      </div>

      {/* Content */}
      <div
        onClick={() => !isLocked && onClick?.(module)}
        className={cn(
          "flex-1 pb-6 pt-1",
          !isLocked && "cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn(
            "h-4 w-4",
            isCompleted ? "text-emerald-500" : isActive ? "text-primary" : "text-muted-foreground"
          )} />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {module.content_type || "lesson"}
          </span>
          {module.xp_reward && (
            <span className="text-xs text-amber-600 font-medium">+{module.xp_reward} XP</span>
          )}
        </div>
        <h4 className={cn(
          "font-medium mt-1",
          isLocked ? "text-muted-foreground" : "text-foreground"
        )}>
          {module.title}
        </h4>
        {module.description && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{module.description}</p>
        )}
        {isCompleted && score != null && (
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              score >= 85 ? "bg-emerald-50 text-emerald-700" :
              score >= 70 ? "bg-amber-50 text-amber-700" :
              "bg-red-50 text-red-700"
            )}>
              Score: {score}%
            </div>
          </div>
        )}
        {module.estimated_minutes && !isLocked && (
          <p className="text-xs text-muted-foreground mt-1">{module.estimated_minutes} min</p>
        )}
      </div>
    </motion.div>
  );
}