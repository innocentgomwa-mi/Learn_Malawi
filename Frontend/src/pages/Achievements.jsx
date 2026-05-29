// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { loadDashboardData } from "@/lib/dashboardStorage";
import { fetchStudentProgress } from "@/api";
import ResourcePageHero from "@/components/ResourcePageHero";
import {
  PAGE_WRAP,
  SPINNER_CLASS,
} from "@/lib/resourcePageStyles";
import {
  Trophy,
  Lock,
  Target,
  BookOpen,
  ClipboardCheck,
  Star,
  Flame,
  LayoutGrid,
  TrendingUp,
  Gem,
  Award,
  Medal,
} from "lucide-react";

/** Lighter blue borders so badges read separately from the dark blue summary hero */
const BADGE_EARNED_CLASS =
  "flex flex-col rounded-[1.75rem] border border-blue-300 bg-yellow-400 p-5 text-center shadow-[0_8px_20px_-12px_rgba(59,130,246,0.2)]";

const BADGE_LOCKED_CLASS =
  "relative flex flex-col rounded-[1.75rem] border border-blue-200 bg-yellow-50 p-5 text-center";

const BADGE_DEFINITIONS = [
  {
    id: "first_step",
    Icon: Target,
    name: "First Step",
    desc: "Complete your first study note",
    check: (prog, att) => prog.filter((p) => p.completed).length >= 1,
  },
  {
    id: "bookworm",
    Icon: BookOpen,
    name: "Bookworm",
    desc: "Complete 10 study notes",
    check: (prog) => prog.filter((p) => p.completed && p.resource_type === "study_note").length >= 10,
  },
  {
    id: "quiz_taker",
    Icon: ClipboardCheck,
    name: "Quiz Taker",
    desc: "Attempt your first quiz",
    check: (prog, att) => att.length >= 1,
  },
  {
    id: "quiz_master",
    Icon: Trophy,
    name: "Quiz Master",
    desc: "Score 90%+ on any quiz",
    check: (prog, att) => att.some((a) => a.score >= 90),
  },
  {
    id: "top_scorer",
    Icon: Star,
    name: "Top Scorer",
    desc: "Score 100% on any quiz",
    check: (prog, att) => att.some((a) => a.score === 100),
  },
  {
    id: "persistent_learner",
    Icon: Flame,
    name: "Persistent Learner",
    desc: "Attempt 5 or more quizzes",
    check: (prog, att) => att.length >= 5,
  },
  {
    id: "well_rounded",
    Icon: LayoutGrid,
    name: "Well-Rounded",
    desc: "Complete resources in 3+ different subjects",
    check: (prog) => new Set(prog.filter((p) => p.completed && p.subject).map((p) => p.subject)).size >= 3,
  },
  {
    id: "high_achiever",
    Icon: TrendingUp,
    name: "High Achiever",
    desc: "Average quiz score of 80%+",
    check: (prog, att) => att.length >= 3 && att.reduce((s, a) => s + a.score, 0) / att.length >= 80,
  },
  {
    id: "completionist",
    Icon: Gem,
    name: "Completionist",
    desc: "Complete 25 study resources",
    check: (prog) => prog.filter((p) => p.completed).length >= 25,
  },
];

function BadgeIcon({ Icon, earned }) {
  return (
    <div
      className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border ${
        earned
          ? "border-blue-400 bg-yellow-300/90"
          : "border-blue-200 bg-yellow-100"
      }`}
    >
      <Icon
        className={`h-7 w-7 ${earned ? "text-blue-800" : "text-blue-400"}`}
        strokeWidth={1.75}
      />
    </div>
  );
}

function BadgeCard({ badge, earned }) {
  const { Icon, name, desc } = badge;

  if (earned) {
    return (
      <div className={BADGE_EARNED_CLASS}>
        <BadgeIcon Icon={Icon} earned />
        <p className="font-poppins text-sm font-bold text-blue-900">{name}</p>
        <p className="mt-1 text-xs leading-relaxed text-blue-800/80">{desc}</p>
        <span className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full border border-blue-300 bg-yellow-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
          <Medal className="h-3 w-3" /> Unlocked
        </span>
      </div>
    );
  }

  return (
    <div className={`${BADGE_LOCKED_CLASS} opacity-75`}>
      <div className="absolute right-3 top-3 rounded-full border border-blue-200 bg-yellow-100 p-1.5">
        <Lock className="h-3.5 w-3.5 text-blue-400" aria-hidden />
      </div>
      <BadgeIcon Icon={Icon} earned={false} />
      <p className="font-poppins text-sm font-semibold text-blue-900">{name}</p>
      <p className="mt-1 text-xs leading-relaxed text-blue-800/70">{desc}</p>
    </div>
  );
}

export default function Achievements() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const updateOnline = () => setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const userKey = user?.email || user?.id || "anonymous";
  const localData = loadDashboardData(userKey);

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ["studentProgress", user?.email, isOnline],
    queryFn: () => fetchStudentProgress({ studentEmail: user?.email }),
    enabled: Boolean(user?.email && isOnline),
    retry: 1,
    staleTime: 1000 * 60,
  });

  const useRemoteData = isOnline && !error && Array.isArray(entries);
  const progress = useRemoteData
    ? entries.filter((entry) => entry.entry_type === "study")
    : Array.isArray(localData.progress)
      ? localData.progress
      : [];
  const attempts = useRemoteData
    ? entries.filter((entry) => entry.entry_type === "quiz")
    : Array.isArray(localData.attempts)
      ? localData.attempts
      : [];

  const loadingState = isLoading && isOnline;
  const earned = BADGE_DEFINITIONS.filter((b) => b.check(progress, attempts));
  const locked = BADGE_DEFINITIONS.filter((b) => !b.check(progress, attempts));
  const progressPercent = Math.round((earned.length / BADGE_DEFINITIONS.length) * 100);
  const LatestIcon = earned.length > 0 ? earned[earned.length - 1].Icon : Award;

  if (loadingState) {
    return (
      <div className={`${PAGE_WRAP} flex justify-center py-24`}>
        <div className={SPINNER_CLASS} />
      </div>
    );
  }

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={Trophy}
        title="Achievements"
        subtitle="Earn badges by learning, completing resources, and acing quizzes."
      />

      <div className="mb-8 overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-300/60 bg-yellow-400/20">
            <LatestIcon className="h-8 w-8 text-yellow-300" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300/90">Your progress</p>
            <p className="mt-1 font-poppins text-3xl font-bold">
              {earned.length}
              <span className="text-xl font-semibold text-blue-200/80"> / {BADGE_DEFINITIONS.length}</span>
              <span className="ml-2 text-lg font-medium text-blue-100/90">badges</span>
            </p>
            <p className="mt-1 text-sm text-blue-100/80">
              {locked.length > 0
                ? `${locked.length} more to unlock — keep learning!`
                : "You've unlocked every badge. Outstanding work!"}
            </p>
            <div className="mt-4 h-2.5 max-w-md overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-blue-200/70">{progressPercent}% complete</p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-yellow-300">{earned.length}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-blue-100/80">Earned</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-white">{locked.length}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-blue-100/80">Locked</p>
            </div>
          </div>
        </div>
      </div>

      {earned.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <h2 className="font-poppins text-lg font-bold text-blue-950">Earned badges</h2>
            <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-800">
              {earned.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earned.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-400" />
            <h2 className="font-poppins text-lg font-bold text-blue-950">Locked badges</h2>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
              {locked.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned={false} />
            ))}
          </div>
        </section>
      )}

      {earned.length === 0 && locked.length === BADGE_DEFINITIONS.length && (
        <div className="rounded-2xl border border-blue-200/80 bg-white py-16 text-center">
          <Target className="mx-auto mb-4 h-12 w-12 text-blue-400" strokeWidth={1.5} />
          <p className="font-medium text-blue-950">No badges yet</p>
          <p className="mt-1 text-sm text-blue-900/70">
            Complete a study note or take a quiz to earn your first achievement.
          </p>
        </div>
      )}
    </div>
  );
}
