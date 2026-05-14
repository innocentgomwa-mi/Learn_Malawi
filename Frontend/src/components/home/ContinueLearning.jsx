import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext.jsx";
import { fetchStudentProgress } from "@/api";

const getEntryRoute = (entry) => {
  const id = entry.resource_id || entry.quiz_id;
  const type = (entry.resource_type || "").toLowerCase();
  const entryType = (entry.entry_type || "").toLowerCase();

  if ((entryType.includes("learning_path") || type.includes("learning_path")) && id) {
    return `/learning-paths?path_id=${encodeURIComponent(id)}`;
  }

  if (entryType === "study" || type.includes("study") || type.includes("study_note") || type.includes("study-notes")) {
    return id ? `/study-notes?selected_id=${encodeURIComponent(id)}` : "/study-notes";
  }

  if (type.includes("tutorial")) {
    return id ? `/tutorials?selected_id=${encodeURIComponent(id)}` : "/tutorials";
  }

  if (type.includes("paper") || type.includes("past_paper") || type.includes("past-paper")) {
    return id ? `/past-papers?selected_id=${encodeURIComponent(id)}` : "/past-papers";
  }

  if (entryType === "quiz") {
    return `/quizzes`;
  }

  return "/learning-history";
};

const getEntryTitle = (entry) => {
  if (entry.title) return entry.title;
  if (entry.resource_title) return entry.resource_title;
  if (entry.name) return entry.name;
  if (entry.resource_type?.toString().includes("learning_path")) return "Learning Path";
  return "Continue learning";
};

const getEntryTypeLabel = (entry) => {
  if (entry.entry_type === "learning_path" || entry.resource_type?.toString().includes("learning_path")) return "Learning Path";
  if (entry.entry_type === "study") return "Study Notes";
  if (entry.entry_type === "quiz") return "Quiz";
  if (entry.resource_type?.toString().toLowerCase().includes("tutorial")) return "Tutorial";
  if (entry.resource_type?.toString().toLowerCase().includes("paper")) return "Past Paper";
  return entry.type || "Learning";
};

const getEntryProgressValue = (entry) => {
  if (typeof entry.progress === "number") return Math.min(Math.max(entry.progress, 0), 100);
  if (typeof entry.completed_percent === "number") return Math.min(Math.max(entry.completed_percent, 0), 100);
  if (typeof entry.score === "number" && typeof entry.total_questions === "number" && entry.total_questions > 0) {
    return Math.round((entry.score / entry.total_questions) * 100);
  }
  if (entry.completed === true) return 100;
  if (entry.completed === false) return 20;
  return 35;
};

const getEntryTimeLeft = (entry) => {
  if (entry.time_left) return entry.time_left;
  if (entry.remaining_time) return entry.remaining_time;
  if (entry.completed) return "Completed";
  return "Resume now";
};

const normalizeEntry = (entry, index) => ({
  key: `${entry.resource_id || entry.quiz_id || entry.title || entry.resource_title || "learning"}-${index}`,
  title: getEntryTitle(entry),
  subject: entry.subject || entry.topic || entry.resource_title || "General",
  type: getEntryTypeLabel(entry),
  progress: getEntryProgressValue(entry),
  timeLeft: getEntryTimeLeft(entry),
  route: getEntryRoute(entry),
  color: entry.color || "bg-blue-500",
  badgeColor: entry.badgeColor || "bg-blue-500/10 text-blue-600",
});

export default function ContinueLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user?.email) {
      setRecent([]);
      setIsLoading(false);
      setHasLoaded(true);
      return;
    }

    setIsLoading(true);
    fetchStudentProgress({ studentEmail: user.email })
      .then((entries) => {
        if (!mounted) return;
        const normalized = Array.isArray(entries) ? entries.slice(0, 4).map(normalizeEntry) : [];
        setRecent(normalized);
      })
      .catch(() => {
        if (!mounted) return;
        setRecent([]);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
        setHasLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Continue Learning</h2>
          <p className="text-sm text-muted-foreground">Pick up where you left off</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/learning-history')}
          className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          History <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Loading history...</div>
      ) : recent.length > 0 ? (
        <div className="flex flex-col gap-3">
          {recent.map((item) => (
            <button
              key={item.key || `${item.title}-${item.subject}`}
              type="button"
              onClick={() => item.route && navigate(item.route)}
              className="text-left bg-card rounded-xl border p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`w-1 self-stretch rounded-full ${item.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold font-heading truncate">{item.title}</h4>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 shrink-0 ${item.badgeColor}`}>
                    {item.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{item.subject}</p>
                <div className="flex items-center gap-3">
                  <Progress value={item.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">{item.progress}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">{item.timeLeft}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">No learning history available yet.</p>
          <p className="mb-4">Start a study note, quiz, or learning path and your progress will appear here.</p>
          <button
            type="button"
            onClick={() => navigate('/study-notes')}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Explore study notes
          </button>
        </div>
      )}
    </section>
  );
}