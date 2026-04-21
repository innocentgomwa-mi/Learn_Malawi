// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/lib/AuthContext";
import { loadDashboardData } from "@/lib/dashboardStorage";
import { fetchStudentProgress } from "@/api";
import { Trophy, Lock, Loader2 } from "lucide-react";

const BADGE_DEFINITIONS = [
  {
    id: "first_step", icon: "🎯", name: "First Step", desc: "Complete your first study note",
    check: (prog, att) => prog.filter(p => p.completed).length >= 1,
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "bookworm", icon: "📚", name: "Bookworm", desc: "Complete 10 study notes",
    check: (prog) => prog.filter(p => p.completed && p.resource_type === "study_note").length >= 10,
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "quiz_taker", icon: "✏️", name: "Quiz Taker", desc: "Attempt your first quiz",
    check: (prog, att) => att.length >= 1,
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "quiz_master", icon: "🏆", name: "Quiz Master", desc: "Score 90%+ on any quiz",
    check: (prog, att) => att.some(a => a.score >= 90),
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "top_scorer", icon: "⭐", name: "Top Scorer", desc: "Score 100% on any quiz",
    check: (prog, att) => att.some(a => a.score === 100),
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "persistent_learner", icon: "🔥", name: "Persistent Learner", desc: "Attempt 5 or more quizzes",
    check: (prog, att) => att.length >= 5,
    color: "from-red-400 to-rose-500",
  },
  {
    id: "well_rounded", icon: "🌟", name: "Well-Rounded", desc: "Complete resources in 3+ different subjects",
    check: (prog) => new Set(prog.filter(p => p.completed && p.subject).map(p => p.subject)).size >= 3,
    color: "from-teal-400 to-cyan-500",
  },
  {
    id: "high_achiever", icon: "🚀", name: "High Achiever", desc: "Average quiz score of 80%+",
    check: (prog, att) => att.length >= 3 && (att.reduce((s, a) => s + a.score, 0) / att.length) >= 80,
    color: "from-indigo-400 to-blue-500",
  },
  {
    id: "completionist", icon: "💎", name: "Completionist", desc: "Complete 25 study resources",
    check: (prog) => prog.filter(p => p.completed).length >= 25,
    color: "from-violet-400 to-purple-600",
  },
];

export default function Achievements() {
  const { user } = useAuth();
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

  const userKey = user?.email || user?.id || 'anonymous';
  const localData = loadDashboardData(userKey);

  const { data: entries = [], isLoading, error } = useQuery(
    ['studentProgress', user?.email, isOnline],
    () => fetchStudentProgress({ studentEmail: user?.email }),
    {
      enabled: Boolean(user?.email && isOnline),
      retry: 1,
      staleTime: 1000 * 60,
    },
  );

  const useRemoteData = isOnline && !error && Array.isArray(entries);
  const progress = useRemoteData
    ? entries.filter((entry) => entry.entry_type === 'study')
    : Array.isArray(localData.progress)
      ? localData.progress
      : [];
  const attempts = useRemoteData
    ? entries.filter((entry) => entry.entry_type === 'quiz')
    : Array.isArray(localData.attempts)
      ? localData.attempts
      : [];

  const loadingState = isLoading && isOnline;
  const earned = BADGE_DEFINITIONS.filter((b) => b.check(progress, attempts));
  const locked = BADGE_DEFINITIONS.filter((b) => !b.check(progress, attempts));

  if (loadingState) return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-xl p-2"><Trophy className="h-6 w-6 text-amber-600" /></div>
        <div>
          <h1 className="font-poppins text-2xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted-foreground text-sm">Earn badges by learning, completing resources, and acing quizzes.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-8 mt-4 flex items-center gap-5">
        <div className="text-5xl">{earned.length > 0 ? earned[earned.length - 1]?.icon : "🎓"}</div>
        <div>
          <p className="font-poppins font-bold text-2xl text-foreground">{earned.length} / {BADGE_DEFINITIONS.length} Badges</p>
          <p className="text-muted-foreground text-sm mt-1">{locked.length > 0 ? `${locked.length} more to unlock!` : "You've unlocked all badges! Amazing!"}</p>
          <div className="mt-2 h-2 bg-amber-200 dark:bg-amber-800 rounded-full w-48 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${(earned.length / BADGE_DEFINITIONS.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <>
          <h2 className="font-poppins font-bold text-foreground mb-4">🎉 Earned Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {earned.map(badge => (
              <div key={badge.id} className={`bg-gradient-to-br ${badge.color} rounded-2xl p-4 text-white text-center shadow-md`}>
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-poppins font-bold text-sm">{badge.name}</p>
                <p className="text-xs opacity-80 mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <>
          <h2 className="font-poppins font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="h-4 w-4" /> Locked Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {locked.map(badge => (
              <div key={badge.id} className="bg-muted border border-border rounded-2xl p-4 text-center opacity-60">
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <p className="font-semibold text-sm text-foreground">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}