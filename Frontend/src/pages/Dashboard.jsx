// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { loadDashboardData } from "@/lib/dashboardStorage";
import { fetchStudentProgress } from "@/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ResourcePageHero from "@/components/ResourcePageHero";
import {
  PAGE_WRAP,
  CARD_CLASS,
  SPINNER_CLASS,
  YELLOW_BUTTON_SM,
} from "@/lib/resourcePageStyles";
import {
  LayoutDashboard,
  BookOpenCheck,
  Library,
  TrendingUp,
  Trophy,
  Target,
  ChevronRight,
  Award,
} from "lucide-react";

const CHART_COLORS = ["#1e40af", "#2563eb", "#facc15", "#eab308", "#3b82f6", "#fbbf24"];

export default function Dashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      const userKey = user?.id || user?.email;
      if (!userKey) {
        setProgress([]);
        setAttempts([]);
        setLoading(false);
        return;
      }
      const dashboardData = loadDashboardData(userKey);
      let remoteEntries = [];
      if (user?.email) {
        try {
          remoteEntries = await fetchStudentProgress({ studentEmail: user.email });
        } catch {
          remoteEntries = [];
        }
      }
      const hasRemote = Array.isArray(remoteEntries) && remoteEntries.length > 0;
      const mappedProgress = hasRemote
        ? remoteEntries.filter((entry) => entry.entry_type !== "quiz")
        : dashboardData.progress;
      const mappedAttempts = hasRemote
        ? remoteEntries
            .filter((entry) => entry.entry_type === "quiz")
            .map((entry) => ({
              id: entry.id || `quiz-${entry.quiz_id}-${entry.completed_at || entry.createdDate || Date.now()}`,
              quiz_title: entry.quiz_title || entry.resource_title || "Quiz attempt",
              subject: entry.subject || "General",
              level: entry.level || "",
              score: Number(entry.score ?? entry.average_score ?? 0),
              total_questions: Number(entry.total_questions ?? 0),
              correct_answers: Number(entry.correct_answers ?? 0),
              completed_at: entry.completed_at || entry.createdDate || entry.created_at,
            }))
        : dashboardData.attempts;
      if (!active) return;
      setProgress(Array.isArray(mappedProgress) ? mappedProgress : []);
      setAttempts(Array.isArray(mappedAttempts) ? mappedAttempts : []);
      setLoading(false);
    };
    loadData();
    return () => {
      active = false;
    };
  }, [user]);

  const userName = user
    ? user.full_name || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "My Dashboard";

  const subjectMap = {};
  progress.forEach((p) => {
    if (!p.subject) return;
    if (!subjectMap[p.subject]) subjectMap[p.subject] = { total: 0, done: 0 };
    subjectMap[p.subject].total++;
    if (p.completed) subjectMap[p.subject].done++;
  });

  const subjectData = Object.entries(subjectMap)
    .map(([name, { total, done }]) => ({
      name,
      pct: Math.round((done / total) * 100),
      done,
      total,
    }))
    .sort((a, b) => b.pct - a.pct);

  const totalCompleted = progress.filter((p) => p.completed).length;
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.score)) : 0;

  const quickLinks = [
    { to: "/study-notes", label: "Study notes", icon: BookOpenCheck },
    { to: "/quizzes", label: "Quizzes", icon: Target },
    { to: "/achievements", label: "Achievements", icon: Award },
    { to: "/my-schedule", label: "My schedule", icon: Library },
  ];

  if (loading) {
    return (
      <div className={`${PAGE_WRAP} flex justify-center py-24`}>
        <div className={SPINNER_CLASS} />
      </div>
    );
  }

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={LayoutDashboard}
        title={userName}
        subtitle={user?.email ? `${user.email} — track your learning progress and quiz performance.` : "Track your learning progress and quiz performance."}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: BookOpenCheck, label: "Completed", value: totalCompleted, accent: "from-blue-900 to-blue-700" },
          { icon: Library, label: "Tracked", value: progress.length, accent: "from-blue-700 to-blue-600" },
          { icon: TrendingUp, label: "Avg quiz score", value: `${avgScore}%`, accent: "from-yellow-400 to-yellow-500" },
          { icon: Trophy, label: "Best score", value: `${bestScore}%`, accent: "from-yellow-300 to-amber-400" },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className={`${CARD_CLASS} overflow-hidden p-0`}>
            <div className={`bg-gradient-to-br ${accent} px-4 py-3`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="p-4 text-center">
              <p className="font-poppins text-2xl font-bold text-blue-950">{value}</p>
              <p className="mt-1 text-xs font-medium text-blue-900/70">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 -mx-1 overflow-x-auto rounded-2xl border border-yellow-300 bg-yellow-100/95 p-2 shadow-sm sm:mx-0 sm:overflow-visible">
        <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="inline-flex items-center gap-2 rounded-xl border border-yellow-400 bg-yellow-200 px-4 py-2 text-sm font-semibold text-blue-950 transition-all hover:bg-yellow-300 whitespace-nowrap"
          >
            <Icon className="h-4 w-4" />
            {label}
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        ))}
        </div>
      </div>

      {subjectData.length > 0 ? (
        <div className={`${CARD_CLASS} mb-6 p-6`}>
          <h2 className="mb-6 font-poppins text-lg font-bold text-blue-950">Progress by subject</h2>
          <div className="mb-6 space-y-4">
            {subjectData.map(({ name, pct, done, total }, i) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-blue-950">{name}</span>
                  <span className="text-blue-900/60">
                    {done}/{total} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#1e3a8a" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#1e3a8a" }} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {subjectData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={`${CARD_CLASS} mb-6 py-14 text-center`}>
          <BookOpenCheck className="mx-auto mb-3 h-10 w-10 text-blue-400" />
          <p className="font-medium text-blue-950">No progress tracked yet</p>
          <p className="mt-1 text-sm text-blue-900/70">
            Open a study note and mark it complete to start building your dashboard.
          </p>
          <Link to="/study-notes" className={`${YELLOW_BUTTON_SM} mt-4 inline-flex`}>
            Browse study notes
          </Link>
        </div>
      )}

      {attempts.length > 0 && (
        <div className={`${CARD_CLASS} overflow-hidden`}>
          <div className="border-b border-blue-100 bg-blue-50/50 px-5 py-4">
            <h2 className="font-poppins font-bold text-blue-950">Recent quiz attempts</h2>
          </div>
          <div className="divide-y divide-blue-100">
            {attempts.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-blue-950">{a.quiz_title}</p>
                  <p className="text-xs text-blue-900/60">
                    {a.subject} · {a.level}
                  </p>
                </div>
                <div
                  className={`font-poppins text-lg font-bold ${
                    a.score >= 70 ? "text-yellow-600" : a.score >= 50 ? "text-blue-600" : "text-red-500"
                  }`}
                >
                  {a.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
