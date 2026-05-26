import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, GraduationCap, BookOpen, Activity, TrendingUp, CheckCircle } from "lucide-react";
import { subDays, format, parseISO } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function PlatformOverviewInsights() {
  const { data: students = [] } = useQuery({ queryKey: ["ins-students"], queryFn: () => apiClient.entities.Student.list() });
  const { data: teachers = [] } = useQuery({ queryKey: ["ins-teachers"], queryFn: () => apiClient.entities.Teacher.list() });
  const { data: posts = [] } = useQuery({ queryKey: ["ins-posts"], queryFn: () => apiClient.entities.TeacherPost.list() });
  const { data: studyNotes = [] } = useQuery({ queryKey: ["ins-study-notes"], queryFn: () => apiClient.entities.StudyNote.list() });
  const { data: tutorials = [] } = useQuery({ queryKey: ["ins-tutorials"], queryFn: () => apiClient.entities.Tutorial.list() });
  const { data: pastPapers = [] } = useQuery({ queryKey: ["ins-past-papers"], queryFn: () => apiClient.entities.PastPaper.list() });
  const { data: quizzes = [] } = useQuery({ queryKey: ["ins-quizzes"], queryFn: () => apiClient.entities.Quiz.list() });
  const { data: careerResources = [] } = useQuery({ queryKey: ["ins-career-resources"], queryFn: () => apiClient.entities.CareerResource.list() });
  const { data: logs = [] } = useQuery({ queryKey: ["ins-logs"], queryFn: () => apiClient.entities.ActivityLog.list() });

  // Activity trend: last 14 days
  const activityTrend = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const dateStr = format(day, "yyyy-MM-dd");
    const count = logs.filter(l => l.created_date?.startsWith(dateStr)).length;
    return { date: format(day, "MMM d"), events: count };
  });

  // Role breakdown
  const roleData = [
    { name: "Students", value: students.length },
    { name: "Teachers", value: teachers.length },
  ];

  // Post published vs draft breakdown
  const allResources = [
    ...posts,
    ...studyNotes,
    ...tutorials,
    ...pastPapers,
    ...quizzes,
    ...careerResources,
  ];

  const postStatus = [
    { name: "Published", value: allResources.filter(p => p.status === "approved").length },
    { name: "Draft", value: allResources.filter(p => p.status !== "approved").length },
  ];

  // Action breakdown
  const actionCounts = {};
  logs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] || 0) + 1; });
  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.replace(/_/g, " "), count }));

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active Teachers", value: teachers.filter(t => t.status === "active").length, icon: GraduationCap, color: "text-emerald-600 bg-emerald-50" },
    { label: "Published Resources", value: allResources.filter(p => p.status === "approved").length, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Total Events (30d)", value: logs.filter(l => new Date(l.created_date) >= subDays(new Date(), 30)).length, icon: Activity, color: "text-orange-600 bg-orange-50" },
    { label: "Draft Resources", value: allResources.filter(p => p.status !== "approved").length, icon: TrendingUp, color: "text-yellow-600 bg-yellow-50" },
    { label: "Publish Rate", value: allResources.length ? `${Math.round((allResources.filter(p => p.status === "approved").length / allResources.length) * 100)}%` : "0%", icon: CheckCircle, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Platform Activity – Last 14 Days</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityTrend}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="events" stroke="#3b82f6" fill="url(#actGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Published vs Draft */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Published vs Draft Resources</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={postStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {postStatus.map((_, i) => <Cell key={i} fill={["#10b981", "#f59e0b"][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Top User Actions</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topActions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}