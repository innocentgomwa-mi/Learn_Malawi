import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Star, TrendingUp, Zap } from "lucide-react";

const SUBJECT_COLORS = {
  Mathematics: "#3B82F6",
  English: "#10B981",
  Science: "#F59E0B",
  Biology: "#8B5CF6",
  Chemistry: "#EF4444",
  Physics: "#06B6D4",
  History: "#F97316",
  Geography: "#84CC16",
};

export default function StudentProgressOverview({ currentUser }) {
  const email = currentUser?.email;

  const { data: progress = [] } = useQuery({
    queryKey: ["student-progress", email],
    queryFn: () => email
      ? apiClient.entities.StudentProgress.filter({ student_email: email })
      : Promise.resolve([]),
    enabled: !!email,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["activity-log", email],
    queryFn: () => email
      ? apiClient.entities.ActivityLog.filter({ user_email: email }, "-created_date", 50)
      : Promise.resolve([]),
    enabled: !!email,
  });

  const totalQuizzes = progress.reduce((s, p) => s + (p.quizzes_completed || 0), 0);
  const totalResources = progress.reduce((s, p) => s + (p.resources_accessed || 0), 0);
  const avgScore = progress.length
    ? Math.round(progress.reduce((s, p) => s + (p.average_score || 0), 0) / progress.length)
    : 0;
  const activeSubjects = progress.length;

  const stats = [
    { label: "Quizzes Completed", value: totalQuizzes, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "Resources Accessed", value: totalResources, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "Avg. Quiz Score", value: `${avgScore}%`, icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: "Active Subjects", value: activeSubjects, icon: Zap, color: "text-purple-600 bg-purple-50" },
  ];

  // Radar chart data
  const radarData = progress.map(p => ({
    subject: p.subject?.substring(0, 4),
    score: p.average_score || 0,
    fullMark: 100,
  }));

  // Line chart — weekly scores across all subjects
  const allWeekly = {};
  progress.forEach(p => {
    (p.weekly_scores || []).forEach(ws => {
      if (!allWeekly[ws.week]) allWeekly[ws.week] = { week: ws.week };
      allWeekly[ws.week][p.subject] = ws.score;
    });
  });
  const lineData = Object.values(allWeekly).sort((a, b) => a.week.localeCompare(b.week));

  // Subject breakdown bar
  const subjectBreakdown = progress
    .map(p => ({ subject: p.subject, quizzes: p.quizzes_completed || 0, score: p.average_score || 0 }))
    .sort((a, b) => b.quizzes - a.quizzes);

  if (!email) {
    return (
      <div className="text-center py-20 text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">Sign in to view your progress</p>
      </div>
    );
  }

  if (progress.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No progress data yet</p>
        <p className="text-sm mt-1">Complete quizzes and access resources to see your growth here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Subject Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Score Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {lineData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No weekly data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {progress.slice(0, 4).map(p => (
                    <Line
                      key={p.subject}
                      type="monotone"
                      dataKey={p.subject}
                      stroke={SUBJECT_COLORS[p.subject] || "#6B7280"}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800">Subject Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectBreakdown.map(({ subject, quizzes, score }) => (
              <div key={subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{subject}</span>
                  <span className="text-gray-500">{quizzes} quizzes · {score}% avg</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: SUBJECT_COLORS[subject] || "#6B7280" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
