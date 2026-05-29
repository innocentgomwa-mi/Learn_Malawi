// @ts-nocheck
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDetailModal({ student, activities, quizAttempts, open, onClose }) {
  if (!student) return null;

  const subjectCounts = activities.reduce((acc, a) => {
    if (a.subject) acc[a.subject] = (acc[a.subject] || 0) + 1;
    return acc;
  }, {});
  const subjectData = Object.entries(subjectCounts).map(([name, count]) => ({ name, count }));

  const totalTime = activities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
  const avgScore = quizAttempts.length
    ? (quizAttempts.reduce((s, q) => s + q.score_percentage, 0) / quizAttempts.length).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{student}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{activities.length}</p>
            <p className="text-xs text-gray-500">Total Events</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{Math.round(totalTime / 60)}m</p>
            <p className="text-xs text-gray-500">Time Spent</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{avgScore ? `${avgScore}%` : "—"}</p>
            <p className="text-xs text-gray-500">Avg Quiz Score</p>
          </div>
        </div>

        {subjectData.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Subject Engagement</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={subjectData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {quizAttempts.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Quiz Attempts ({quizAttempts.length})</p>
            <div className="space-y-2">
              {quizAttempts.map((q) => (
                <div key={q.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{q.quiz_title || q.subject}</p>
                    <p className="text-xs text-gray-400">{q.level} • {format(new Date(q.created_date), "dd MMM yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${q.score_percentage >= 50 ? "text-green-600" : "text-red-500"}`}>
                      {q.score_percentage?.toFixed(0)}%
                    </span>
                    <Badge variant={q.passed ? "default" : "destructive"} className="text-xs">
                      {q.passed ? "Pass" : "Fail"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}