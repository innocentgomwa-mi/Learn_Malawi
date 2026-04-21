// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuizPerformanceTable({ attempts }) {
  if (!attempts || attempts.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">No quiz attempts recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto max-h-96 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{a.user_name || a.user_email}</p>
                  <p className="text-xs text-gray-400">{a.quiz_title || "—"}</p>
                </div>
              </TableCell>
              <TableCell><Badge variant="outline">{a.subject}</Badge></TableCell>
              <TableCell><span className="text-sm">{a.level}</span></TableCell>
              <TableCell>
                <span className={`font-bold text-sm ${a.score_percentage >= 50 ? "text-green-600" : "text-red-500"}`}>
                  {a.score_percentage?.toFixed(0)}%
                </span>
                <span className="text-xs text-gray-400 ml-1">({a.correct_answers}/{a.total_questions})</span>
              </TableCell>
              <TableCell>
                {a.passed ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="w-3 h-3" />Pass</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3" />Fail</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-gray-500">
                {a.time_taken_seconds ? `${Math.round(a.time_taken_seconds / 60)}m` : "—"}
              </TableCell>
              <TableCell className="text-xs text-gray-400">
                {format(new Date(a.created_date), "dd MMM, HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}