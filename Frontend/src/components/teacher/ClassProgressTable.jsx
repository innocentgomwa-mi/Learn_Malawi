// @ts-nocheck
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ClassProgressTable({ quizAttempts, activities, onSelectStudent }) {
  const studentMap = {};

  quizAttempts.forEach((q) => {
    if (!studentMap[q.user_email]) {
      studentMap[q.user_email] = { email: q.user_email, name: q.user_name || q.user_email, scores: [], subjects: new Set(), level: q.level };
    }
    studentMap[q.user_email].scores.push(q.score_percentage);
    studentMap[q.user_email].subjects.add(q.subject);
  });

  activities.forEach((a) => {
    if (studentMap[a.user_email]) {
      if (!studentMap[a.user_email].timeSpent) studentMap[a.user_email].timeSpent = 0;
      studentMap[a.user_email].timeSpent += (a.duration_seconds || 0);
      if (!studentMap[a.user_email].events) studentMap[a.user_email].events = 0;
      studentMap[a.user_email].events += 1;
    }
  });

  const students = Object.values(studentMap).map((s) => {
    const avg = s.scores.reduce((a, b) => a + b, 0) / s.scores.length;
    const trend = s.scores.length >= 2
      ? s.scores[s.scores.length - 1] - s.scores[s.scores.length - 2]
      : 0;
    return { ...s, avg, trend, subjects: [...s.subjects] };
  }).sort((a, b) => a.avg - b.avg);

  const getScoreColor = (avg) => avg >= 70 ? "text-blue-600" : avg >= 50 ? "text-orange-500" : "text-red-500";
  const getStatusBadge = (avg) => avg >= 70 ? ["On Track", "default"] : avg >= 50 ? ["Needs Attention", "secondary"] : ["At Risk", "destructive"];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Quizzes</TableHead>
            <TableHead>Avg Score</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Time on Platform</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 && (
            <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-8">No student data yet.</TableCell></TableRow>
          )}
          {students.map((s) => {
            const [label, variant] = getStatusBadge(s.avg);
            return (
              <TableRow key={s.email} className="cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => onSelectStudent(s.email)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {s.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{s.level}</Badge></TableCell>
                <TableCell><span className="text-xs text-gray-600">{s.subjects.join(", ")}</span></TableCell>
                <TableCell className="text-sm">{s.scores.length}</TableCell>
                <TableCell>
                  <span className={`font-bold text-sm ${getScoreColor(s.avg)}`}>{s.avg.toFixed(0)}%</span>
                </TableCell>
                <TableCell>
                  {s.trend > 0 ? <TrendingUp className="w-4 h-4 text-blue-500" /> :
                   s.trend < 0 ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                   <Minus className="w-4 h-4 text-gray-400" />}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {s.timeSpent ? `${Math.round(s.timeSpent / 60)}m` : "—"}
                </TableCell>
                <TableCell><Badge variant={variant} className="text-xs">{label}</Badge></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}