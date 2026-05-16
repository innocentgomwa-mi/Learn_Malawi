// @ts-nocheck
import { useState, useEffect } from "react";
import { Trophy, Medal, Loader2 } from "lucide-react";

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];

const SAMPLE_ATTEMPTS = [
  { id: "attempt-1", created_by: "estudent@example.com", quiz_title: "MSCE Maths Revision", subject: "Mathematics", level: "MSCE", score: 92, total_questions: 10, correct_answers: 9 },
  { id: "attempt-2", created_by: "mary@example.com", quiz_title: "JCE Science Check", subject: "Science", level: "JCE", score: 84, total_questions: 10, correct_answers: 8 },
  { id: "attempt-3", created_by: "john@example.com", quiz_title: "MSCE Maths Revision", subject: "Mathematics", level: "MSCE", score: 78, total_questions: 10, correct_answers: 7 },
  { id: "attempt-4", created_by: "jane@example.com", quiz_title: "JCE Science Check", subject: "Science", level: "JCE", score: 88, total_questions: 10, correct_answers: 8 },
];

export default function Leaderboard({ quizId, quizTitle } = {}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filtered = quizId
      ? SAMPLE_ATTEMPTS.filter((entry) => entry.quiz_title === quizTitle || entry.quiz_id === quizId)
      : SAMPLE_ATTEMPTS;

    const best = {};
    filtered.forEach((a) => {
      const key = a.created_by || "anonymous";
      if (!best[key] || a.score > best[key].score) {
        best[key] = a;
      }
    });
    const sorted = Object.values(best).sort((a, b) => b.score - a.score).slice(0, 10);
    setEntries(sorted);
    setLoading(false);
  }, [quizId, quizTitle]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-gradient-to-r from-amber-50 to-card dark:from-amber-950/20">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="font-poppins font-bold text-foreground">
          {quizTitle ? `Top Scorers — ${quizTitle}` : "Overall Leaderboard"}
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No scores yet. Be the first to play!</p>
      ) : (
        <div className="divide-y divide-border">
          {entries.map((entry, i) => {
            const name = entry.created_by?.split("@")[0] || "Student";
            return (
              <div key={entry.id} className={`flex items-center gap-4 px-5 py-3 ${i === 0 ? "bg-amber-50/60 dark:bg-amber-950/10" : ""}`}>
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <Medal className={`h-5 w-5 mx-auto ${MEDAL_COLORS[i]}`} />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate capitalize">{name}</p>
                  {!quizId && <p className="text-xs text-muted-foreground truncate">{entry.quiz_title}</p>}
                </div>
                <div className="text-right">
                  <p className={`font-poppins font-bold text-lg ${entry.score >= 70 ? "text-emerald-600" : entry.score >= 50 ? "text-amber-600" : "text-red-500"}`}>
                    {entry.score}%
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.correct_answers}/{entry.total_questions} correct</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}