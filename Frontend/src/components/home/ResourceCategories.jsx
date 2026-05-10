import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, BookOpen, PlayCircle, Brain, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes } from "@/api";

const CATEGORY_METADATA = [
  {
    icon: FileText,
    title: "Notes",
    description: "Comprehensive study notes for all MSCE & JCE subjects, organized by topic.",
    badge: "Popular",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    gradient: "from-blue-50 to-blue-100/50",
    iconBg: "bg-blue-500",
    border: "border-blue-100",
    loader: fetchStudyNotes,
    label: "documents",
  },
  {
    icon: BookOpen,
    title: "Past Papers",
    description: "Exam past papers going back 10 years with full marking schemes and answers.",
    badge: "Essential",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    gradient: "from-purple-50 to-purple-100/50",
    iconBg: "bg-purple-500",
    border: "border-purple-100",
    loader: fetchPastPapers,
    label: "papers",
  },
  {
    icon: PlayCircle,
    title: "Tutorials",
    description: "Step-by-step video and written tutorials taught by experienced educators.",
    badge: "New",
    badgeColor: "bg-green-500/10 text-green-600 border-green-200",
    gradient: "from-green-50 to-green-100/50",
    iconBg: "bg-green-500",
    border: "border-green-100",
    loader: fetchTutorials,
    label: "tutorials",
  },
  {
    icon: Brain,
    title: "Quizzes",
    description: "Test your knowledge with timed quizzes and instant feedback on every answer.",
    badge: "Interactive",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-200",
    gradient: "from-orange-50 to-orange-100/50",
    iconBg: "bg-orange-500",
    border: "border-orange-100",
    loader: fetchQuizzes,
    label: "quizzes",
  },
];

export default function ResourceCategories() {
  const navigate = useNavigate();

  /** @param {string} title */
  const getCategoryPath = (title) => {
    switch (title) {
      case "Notes":
        return "/study-notes";
      case "Past Papers":
        return "/past-papers";
      case "Tutorials":
        return "/tutorials";
      case "Quizzes":
        return "/quizzes";
      default:
        return "/study-notes";
    }
  };

  /** @type {{ [key: string]: number | null }} */
  const initialCounts = {
    Notes: null,
    "Past Papers": null,
    Tutorials: null,
    Quizzes: null,
  };
  const [counts, setCounts] = useState(/** @type {{ [key: string]: number | null }} */ (initialCounts));

  useEffect(() => {
    let mounted = true;

    Promise.all(CATEGORY_METADATA.map((item) => item.loader()))
      .then((results) => {
        if (!mounted) return;
        /** @type {{ [key: string]: number | null }} */
        const nextCounts = {};
        results.forEach((result, index) => {
          const title = CATEGORY_METADATA[index].title;
          nextCounts[title] = Array.isArray(result) ? result.length : 0;
        });
        setCounts(nextCounts);
      })
      .catch(() => {
        if (!mounted) return;
        setCounts({ Notes: 0, "Past Papers": 0, Tutorials: 0, Quizzes: 0 });
      });

    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Browse Resources</h2>
          <p className="text-sm text-muted-foreground">Everything you need to succeed</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/study-notes")}
          className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORY_METADATA.map(({ icon: Icon, title, description, badge, badgeColor, gradient, iconBg, border, label }) => (
          <button
            key={title}
            type="button"
            onClick={() => navigate(getCategoryPath(title))}
            className={`text-left bg-gradient-to-br ${gradient} rounded-xl border ${border} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group`}
          >
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-heading font-semibold text-base">{title}</h3>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${badgeColor} font-medium`}>{badge}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
            <p className="text-xs font-medium text-foreground/60">
              {counts[title] === null ? `Loading ${label}…` : `${counts[title]} ${label}`}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}