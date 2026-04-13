// @ts-nocheck
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile } from "@/api";
import { loadDashboardData } from "@/lib/dashboardStorage";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { User, BookOpen, Trophy, TrendingUp, CheckCircle } from "lucide-react";

const COLORS = ["#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981"];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userKey = user?.id || user?.email;
    if (!userKey) {
      setProgress([]);
      setAttempts([]);
      setLoading(false);
      return;
    }

    const dashboardData = loadDashboardData(userKey);
    setProgress(dashboardData.progress);
    setAttempts(dashboardData.attempts);
    setLoading(false);
  }, [user]);

  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', school: '', level: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        school: user.school || '',
        level: user.level || '',
      });
    }
  }, [user]);

  const userName = user
    ? user.full_name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'My Dashboard';

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileError(null);

    try {
      await updateProfile({ firstName: profileForm.firstName, lastName: profileForm.lastName, school: profileForm.school, level: profileForm.level });
      await refreshUser();
      setProfileSaved(true);
      window.setTimeout(() => setProfileSaved(false), 2500);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : String(saveError);
      setProfileError(message || 'Unable to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Compute per-subject progress
  const subjectMap = {};
  progress.forEach(p => {
    if (!p.subject) return;
    if (!subjectMap[p.subject]) subjectMap[p.subject] = { total: 0, done: 0 };
    subjectMap[p.subject].total++;
    if (p.completed) subjectMap[p.subject].done++;
  });

  const subjectData = Object.entries(subjectMap).map(([name, { total, done }]) => ({
    name,
    pct: Math.round((done / total) * 100),
    done,
    total,
  })).sort((a, b) => b.pct - a.pct);

  const totalCompleted = progress.filter(p => p.completed).length;
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map(a => a.score)) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 rounded-2xl p-3">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="font-poppins text-2xl font-bold text-foreground">{userName}</h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Profile editor */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-poppins text-xl font-bold text-foreground">Profile</h2>
            <p className="text-muted-foreground text-sm">Update your name and keep your dashboard profile current.</p>
          </div>
          <button
            type="button"
            onClick={handleProfileSave}
            disabled={profileSaving}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profileSaving ? 'Saving...' : profileSaved ? 'Saved' : 'Save profile'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">First Name</span>
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(event) => setProfileForm(prev => ({ ...prev, firstName: event.target.value }))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Last Name</span>
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(event) => setProfileForm(prev => ({ ...prev, lastName: event.target.value }))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">School</span>
            <input
              type="text"
              value={profileForm.school}
              onChange={(event) => setProfileForm(prev => ({ ...prev, school: event.target.value }))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Level</span>
            <select
              value={profileForm.level}
              onChange={(event) => setProfileForm(prev => ({ ...prev, level: event.target.value }))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="PSLC">PSLC</option>
              <option value="JCE">JCE</option>
              <option value="MSCE">MSCE</option>
            </select>
          </label>
        </div>
        {profileError ? <p className="mt-4 text-sm text-rose-600">{profileError}</p> : null}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: CheckCircle, label: "Resources Completed", value: totalCompleted, color: "text-emerald-600" },
          { icon: BookOpen, label: "Resources Tracked", value: progress.length, color: "text-blue-600" },
          { icon: TrendingUp, label: "Avg Quiz Score", value: `${avgScore}%`, color: "text-purple-600" },
          { icon: Trophy, label: "Best Quiz Score", value: `${bestScore}%`, color: "text-amber-600" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
            <p className="font-poppins font-bold text-2xl text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Subject Progress */}
      {subjectData.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-poppins font-bold text-foreground mb-6">Progress by Subject</h2>
          <div className="space-y-4 mb-6">
            {subjectData.map(({ name, pct, done, total }, i) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="text-muted-foreground">{done}/{total} completed ({pct}%)</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-10 text-center mb-6">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">No progress tracked yet</p>
          <p className="text-sm text-muted-foreground">Open any Study Note and mark it as completed to start tracking!</p>
        </div>
      )}

      {/* Recent Quiz Attempts */}
      {attempts.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-poppins font-bold text-foreground">Recent Quiz Attempts</h2>
          </div>
          <div className="divide-y divide-border">
            {attempts.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.quiz_title}</p>
                  <p className="text-xs text-muted-foreground">{a.subject} · {a.level}</p>
                </div>
                <div className={`font-poppins font-bold text-lg ${a.score >= 70 ? "text-emerald-600" : a.score >= 50 ? "text-amber-600" : "text-red-500"}`}>
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