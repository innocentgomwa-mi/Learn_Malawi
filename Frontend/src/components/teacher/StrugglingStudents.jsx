// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function StrugglingStudents({ quizAttempts, onSelectStudent }) {
  // Find students who failed at least one quiz
  const studentStats = quizAttempts.reduce((acc, q) => {
    if (!acc[q.user_email]) {
      acc[q.user_email] = { name: q.user_name || q.user_email, email: q.user_email, attempts: 0, failed: 0, avgScore: 0, scores: [] };
    }
    acc[q.user_email].attempts += 1;
    acc[q.user_email].scores.push(q.score_percentage);
    if (!q.passed) acc[q.user_email].failed += 1;
    return acc;
  }, {});

  const students = Object.values(studentStats).map((s) => ({
    ...s,
    avgScore: s.scores.reduce((a, b) => a + b, 0) / s.scores.length,
  })).sort((a, b) => a.avgScore - b.avgScore);

  const struggling = students.filter((s) => s.avgScore < 60 || s.failed > 0);

  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Students Needing Support ({struggling.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {struggling.length === 0 && <p className="text-gray-400 text-sm text-center py-4">All students are performing well!</p>}
          {struggling.map((s) => (
            <div
              key={s.email}
              className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors"
              onClick={() => onSelectStudent(s.email)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-sm">
                  {s.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.attempts} quiz attempt{s.attempts !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${s.avgScore < 50 ? "text-red-500" : "text-orange-500"}`}>
                  {s.avgScore.toFixed(0)}% avg
                </p>
                {s.failed > 0 && (
                  <Badge variant="destructive" className="text-xs">{s.failed} failed</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}