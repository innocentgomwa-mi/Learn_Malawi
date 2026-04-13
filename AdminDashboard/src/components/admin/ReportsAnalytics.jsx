import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, BookOpen, Users, Award } from "lucide-react";

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function ReportsAnalytics() {
  const { data: posts = [] } = useQuery({ queryKey: ["report-posts"], queryFn: () => apiClient.entities.TeacherPost.filter({ status: "approved" }) });
  const { data: students = [] } = useQuery({ queryKey: ["report-students"], queryFn: () => apiClient.entities.Student.list() });
  const { data: logs = [] } = useQuery({ queryKey: ["report-logs"], queryFn: () => apiClient.entities.ActivityLog.list("-created_date", 500) });
  const { data: progress = [] } = useQuery({ queryKey: ["report-progress"], queryFn: () => apiClient.entities.StudentProgress.list() });

  // Resources by subject
  const bySubject = useMemo(() => {
    const map = {};
    posts.forEach(p => { map[p.subject] = (map[p.subject] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([subject, count]) => ({ subject: subject.substring(0, 8), count }));
  }, [posts]);

  // Students by level
  const byLevel = useMemo(() => {
    const map = {};
    students.forEach(s => { map[s.level || "Unknown"] = (map[s.level || "Unknown"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [students]);

  // Content type breakdown
  const byType = useMemo(() => {
    const labels = { study_notes: "Study Notes", past_paper: "Past Paper", tutorial: "Tutorial", quiz: "Quiz", career_resource: "Career" };
    const map = {};
    posts.forEach(p => { const l = labels[p.content_type] || p.content_type; map[l] = (map[l] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [posts]);

  // Average quiz scores per subject
  const quizPerformance = useMemo(() => {
    const map = {};
    progress.forEach(p => {
      if (p.average_score > 0) map[p.subject] = { total: (map[p.subject]?.total || 0) + p.average_score, count: (map[p.subject]?.count || 0) + 1 };
    });
    return Object.entries(map).map(([subject, { total, count }]) => ({ subject: subject.substring(0, 8), avg: Math.round(total / count) }));
  }, [progress]);

  const statCards = [
    { label: "Approved Resources", value: posts.length, icon: BookOpen, color: "text-slate-700 bg-slate-50" },
    { label: "Registered Students", value: students.length, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Platform Events", value: logs.length, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Quiz Records", value: progress.length, icon: Award, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide insights across content, users, and engagement</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
              <div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold">{value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Resources by Subject</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Students by Level</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byLevel} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {byLevel.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Content Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Avg Quiz Score by Subject</CardTitle></CardHeader>
          <CardContent>
            {quizPerformance.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-gray-400 text-sm">No quiz data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={quizPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
