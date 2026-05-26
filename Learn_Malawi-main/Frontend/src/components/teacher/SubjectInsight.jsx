// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function SubjectInsights({ quizAttempts }) {
  const subjectMap = quizAttempts.reduce((acc, q) => {
    if (!acc[q.subject]) acc[q.subject] = { subject: q.subject, scores: [], passed: 0, total: 0 };
    acc[q.subject].scores.push(q.score_percentage);
    acc[q.subject].total += 1;
    if (q.passed) acc[q.subject].passed += 1;
    return acc;
  }, {});

  const data = Object.values(subjectMap).map((s) => ({
    name: s.subject,
    avgScore: parseFloat((s.scores.reduce((a, b) => a + b, 0) / s.scores.length).toFixed(1)),
    passRate: parseFloat(((s.passed / s.total) * 100).toFixed(1)),
    attempts: s.total,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700">Average Score by Subject</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No quiz data available.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.avgScore >= 70 ? "#16a34a" : entry.avgScore >= 50 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {data.map((d) => (
                <div key={d.name} className="text-center bg-gray-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-gray-600 truncate">{d.name}</p>
                  <p className="text-sm font-bold text-gray-800">{d.passRate}%</p>
                  <p className="text-xs text-gray-400">pass rate</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}