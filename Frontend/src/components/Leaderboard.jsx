// @ts-nocheck
import { useState, useEffect } from "react";
import { Trophy, Medal } from "lucide-react";
import { SPINNER_CLASS } from "@/lib/resourcePageStyles";

const MEDAL_COLORS = ["text-yellow-500", "text-blue-400", "text-yellow-700"];

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
    <div className="overflow-hidden rounded-2xl border border-blue-200/80 bg-white">
      <div className="flex items-center gap-2 border-b border-blue-200/80 bg-gradient-to-r from-blue-950 to-blue-800 px-5 py-4">
        <Trophy className="h-5 w-5 text-yellow-400" />
        <h3 className="font-poppins font-bold text-white">
          {quizTitle ? `Top Scorers — ${quizTitle}` : "Overall Leaderboard"}
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className={SPINNER_CLASS} />
        </div>
      ) : entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-blue-900/70">No scores yet. Be the first to play!</p>
      ) : (
        <div className="divide-y divide-blue-100">
          {entries.map((entry, i) => {
            const name = entry.created_by?.split("@")[0] || "Student";
            return (
              <div key={entry.id} className={`flex items-center gap-4 px-5 py-3 ${i === 0 ? "bg-yellow-50/80" : ""}`}>
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <Medal className={`mx-auto h-5 w-5 ${MEDAL_COLORS[i]}`} />
                  ) : (
                    <span className="text-sm font-bold text-blue-900/50">#{i + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold capitalize text-blue-950">{name}</p>
                  {!quizId && <p className="truncate text-xs text-blue-900/60">{entry.quiz_title}</p>}
                </div>
                <div className="text-right">
                  <p className={`font-poppins text-lg font-bold ${entry.score >= 70 ? "text-blue-700" : entry.score >= 50 ? "text-yellow-700" : "text-red-500"}`}>
                    {entry.score}%
                  </p>
                  <p className="text-xs text-blue-900/60">{entry.correct_answers}/{entry.total_questions} correct</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
