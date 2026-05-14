// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/lib/AuthContext";
import { loadDashboardData } from "@/lib/dashboardStorage";
import { fetchStudentProgress } from "@/api";
import { ArrowRight, Clock, FileText, CheckCircle, Loader2 } from "lucide-react";

const getEntryTypeLabel = (entry) => {
  if (entry.entry_type === "learning_path" || entry.resource_type?.toString().includes("learning_path")) return "Learning Path";
  if (entry.entry_type === "study") return "Study Notes";
  if (entry.entry_type === "quiz") return "Quiz";
  if (entry.resource_type?.toString().toLowerCase().includes("tutorial")) return "Tutorial";
  if (entry.resource_type?.toString().toLowerCase().includes("paper")) return "Past Paper";
  return entry.type || "Learning";
};

const getEntryTitle = (entry) => {
  if (entry.resource_title) return entry.resource_title;
  if (entry.title) return entry.title;
  if (entry.name) return entry.name;
  if (entry.resource_type?.toString().includes("learning_path")) return "Learning Path";
  if (entry.entry_type === "quiz") return entry.quiz_title || "Quiz Attempt";
  return "Study Activity";
};

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

  return "/learning-paths";
};

const formatDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function LearningHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const updateOnline = () => setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    updateOnline();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const userKey = user?.email || user?.id || null;
  const localData = loadDashboardData(userKey);

  const { data: remoteEntries = [], isLoading, error } = useQuery({
    queryKey: ['studentProgressHistory', user?.email, isOnline],
    queryFn: () => fetchStudentProgress({ studentEmail: user?.email }),
    enabled: Boolean(user?.email && isOnline),
    retry: 1,
    staleTime: 1000 * 60,
  });

  const useRemoteData = isOnline && !error && Array.isArray(remoteEntries);
  const entries = useRemoteData
    ? remoteEntries
    : Array.isArray(localData.progress)
      ? localData.progress
      : [];

  const sortedEntries = [...entries].sort((a, b) => {
    const aDate = new Date(a.completed_at || a.createdDate || a.created_at || 0).getTime();
    const bDate = new Date(b.completed_at || b.createdDate || b.created_at || 0).getTime();
    return bDate - aDate;
  });

  if (!user?.email) {
    return (
      <div className="w-full px-4 py-8">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Learning History</h1>
          <p className="text-sm text-muted-foreground mb-4">Sign in to see your study progress and resume activity.</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && isOnline) {
    return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-foreground">Learning History</h1>
          <p className="text-sm text-muted-foreground">Review your recent study progress and return to unfinished lessons.</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-slate-50 transition" onClick={() => navigate('/study-notes')}>
          Browse study notes
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No history found yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Start a study note, quiz, or learning path and your recent activity will appear here.</p>
          <button
            type="button"
            onClick={() => navigate('/study-notes')}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            Explore study notes
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedEntries.map((entry) => {
            const route = getEntryRoute(entry);
            const status = entry.completed ? 'Completed' : 'In progress';
            return (
              <div key={entry.id || `${entry.resource_id || entry.quiz_id}-${entry.completed_at || entry.createdDate}`}
                className="rounded-3xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">{getEntryTypeLabel(entry)}</p>
                    <h2 className="text-lg font-semibold text-foreground">{getEntryTitle(entry)}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{entry.subject || entry.level || 'General'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${entry.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    <CheckCircle className="h-3.5 w-3.5" /> {status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDate(entry.completed_at || entry.createdDate || entry.created_at)}</span>
                  {typeof entry.progress === 'number' && (
                    <span>{Math.round(Math.min(Math.max(entry.progress, 0), 100))}% progress</span>
                  )}
                </div>

                {route ? (
                  <button type="button" onClick={() => navigate(route)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Resume activity <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">No direct resume link available for this entry.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
