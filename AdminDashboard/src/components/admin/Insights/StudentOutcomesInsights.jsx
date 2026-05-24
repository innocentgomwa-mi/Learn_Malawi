import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";
import { Award, TrendingUp, Users, BookOpen } from "lucide-react";

const LEVEL_COLORS = { PSLC: "#3b82f6", JCE: "#8b5cf6", MSCE: "#10b981" };

export default function StudentOutcomesInsights() {
  const { data: students = [] } = useQuery({ queryKey: ["so-students"], queryFn: () => apiClient.entities.Student.list() });
  const { data: progress = [] } = useQuery({ queryKey: ["so-progress"], queryFn: () => apiClient.entities.StudentProgress.list() });
  const { data: logs = [] } = useQuery({ queryKey: ["so-logs"], queryFn: () => apiClient.entities.ActivityLog.list() });

  // Students by level
  const byLevel = useMemo(() => ["PSLC", "JCE", "MSCE"].map(level => ({
    level,
    total: students.filter(s => s.level === level).length,
    active: students.filter(s => s.level === level && s.is_active !== false).length,
  })), [students]);

  // Average quiz score by level
  const avgScoreByLevel = useMemo(() => {
    const m = {};
    progress.forEach(p => {
      if (!m[p.level]) m[p.level] = [];
      if (p.average_score) m[p.level].push(p.average_score);
    });
    return ["PSLC", "JCE", "MSCE"].map(level => ({
      level,
      avgScore: m[level]?.length ? Math.round(m[level].reduce((a, b) => a + b, 0) / m[level].length) : 0,
    }));
  }, [progress]);

  // Average score by subject (radar)
  const subjectScores = useMemo(() => {
    const m = {};
    progress.forEach(p => {
      if (!m[p.subject]) m[p.subject] = [];
      if (p.average_score) m[p.subject].push(p.average_score);
    });
    return Object.entries(m)
      .map(([subject, scores]) => ({
        subject: subject.length > 10 ? subject.slice(0, 10) + "…" : subject,
        score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .slice(0, 8);
  }, [progress]);

  // Quizzes completed by level
  const quizzesByLevel = useMemo(() => ["PSLC", "JCE", "MSCE"].map(level => ({
    level,
    quizzes: progress.filter(p => p.level === level).reduce((sum, p) => sum + (p.quizzes_completed || 0), 0),
    resources: progress.filter(p => p.level === level).reduce((sum, p) => sum + (p.resources_accessed || 0), 0),
  })), [progress]);

  // Top performing students
  const topStudents = useMemo(() =>
    [...progress]
      .filter(p => p.average_score > 0)
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, 5),
    [progress]
  );

  // Active vs inactive
  const activeCount = students.filter(s => s.is_active !== false).length;
  const inactiveCount = students.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Level summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {byLevel.map(({ level, total, active }) => (
          <Card key={level} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold" style={{ color: LEVEL_COLORS[level] }}>{level}</span>
                <Badge className="text-xs" style={{ backgroundColor: LEVEL_COLORS[level] + "20", color: LEVEL_COLORS[level] }}>{total} students</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active</span>
                  <span className="font-semibold text-gray-900">{active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Inactive</span>
                  <span className="font-semibold text-gray-500">{total - active}</span>
                </div>
                <div className="mt-2 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: total ? `${(active / total) * 100}%` : "0%", backgroundColor: LEVEL_COLORS[level] }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avg quiz score by level */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> Avg Quiz Score by Level</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={avgScoreByLevel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="avgScore" name="Avg Score" radius={[4, 4, 0, 0]}>
                  {avgScoreByLevel.map(({ level }) => <Cell key={level} fill={LEVEL_COLORS[level]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quizzes & resources by level */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" /> Engagement by Level</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={quizzesByLevel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quizzes" name="Quizzes Done" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resources" name="Resources Accessed" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject performance radar */}
      {subjectScores.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Average Score by Subject</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={subjectScores}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Avg Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top performing students */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Top Performing Students</CardTitle></CardHeader>
        <CardContent>
          {topStudents.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No quiz data recorded yet</p>
            : <div className="space-y-2">
                {topStudents.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.student_name || s.student_email}</p>
                        <p className="text-xs text-gray-400">{s.subject} · {s.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-600">{s.average_score}%</p>
                      <p className="text-xs text-gray-400">{s.quizzes_completed} quiz{s.quizzes_completed !== 1 ? "zes" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}