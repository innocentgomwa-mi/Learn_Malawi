import { Link } from "react-router-dom";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const difficultyColors = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-red-50 text-red-700 border-red-200",
};

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

/**
 * @typedef {{ id: string; category?: keyof typeof categoryGradients | string; title?: string; description?: string; difficulty?: keyof typeof difficultyColors | string; estimated_hours?: number; modules?: any[] }} LearningPath
 * @typedef {{ path: LearningPath; index?: number }} PathCardProps
 */

/** @param {PathCardProps} props */
export default function PathCard({ path, index = 0 }) {
  /** @type {keyof typeof categoryGradients} */
  const gradientKey = (path.category || "general").toString();
  const gradient = categoryGradients[gradientKey] || categoryGradients.general;
  const moduleCount = path.modules?.length || 0;
  /** @type {keyof typeof difficultyColors} */
  const difficultyKey = (path.difficulty || "beginner").toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        to={`/paths/${path.id}`}
        className="group block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full"
      >
        <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-4 left-5">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {(path.category || "general").replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {path.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{path.description}</p>

          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <Badge variant="outline" className={`${difficultyColors[difficultyKey] || ""} text-xs`}>
              {path.difficulty || "beginner"}
            </Badge>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> {moduleCount} modules
            </span>
            {path.estimated_hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {path.estimated_hours}h
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Start Learning <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}