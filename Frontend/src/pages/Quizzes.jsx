/**
 * @typedef {{ question: string, options: string[], answer: string, explanation: string }} QuizQuestion
 */
/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   subject: string,
 *   level: 'PSLC' | 'JCE' | 'MSCE',
 *   difficulty: string,
 *   topic?: string,
 *   questions: QuizQuestion[]
 * }} Quiz
 */

import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Brain, Search, CheckCircle, XCircle, Loader2, RotateCcw, Trophy } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { saveUserAttempt } from "@/lib/dashboardStorage";
import { fetchQuizzes, fetchAiChat } from "@/api";
import Leaderboard from "../components/Leaderboard";

/** @type {Array<'All' | string>} */
const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const LEVEL_COLORS = {
  PSLC: "bg-emerald-100 text-emerald-700",
  JCE: "bg-blue-100 text-blue-700",
  MSCE: "bg-purple-100 text-purple-700",
};


export default function Quizzes() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState(/** @type {'All' | string} */ ("All"));
  const [activeQuiz, setActiveQuiz] = useState(/** @type {Quiz | null} */ (null));
  const [answers, setAnswers] = useState(/** @type {{ [index: number]: string }} */ ({}));
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const queryResult = useQuery({
    queryKey: ['quizzes'],
    queryFn: /** @type {() => Promise<Quiz[]>} */ (() => fetchQuizzes({ level: level === 'All' ? undefined : level, subject: search })),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const { data: quizzes = [], isLoading: loading } = /** @type {import('@tanstack/react-query').UseQueryResult<Quiz[], Error>} */ (queryResult);

  const filtered = quizzes.filter((q) => {
    const matchLevel = level === "All" || q.level === level;
    const matchSearch = !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  /** @param {Quiz} quiz */
  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setAiFeedback("");
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitted(true);
    const questions = activeQuiz.questions || [];
    let correct = 0;
    /** @type {string[]} */
    const wrongTopics = [];

    questions.forEach((q, i) => {
      if (answers[i] === q.answer) {
        correct++;
      } else {
        const snippet = q.question?.slice(0, 50);
        if (snippet) {
          wrongTopics.push(snippet);
        }
      }
    });

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const attempt = {
      id: `${activeQuiz.id}-${Date.now()}`,
      quiz_id: activeQuiz.id,
      quiz_title: activeQuiz.title,
      subject: activeQuiz.subject,
      level: activeQuiz.level,
      score,
      total_questions: questions.length,
      correct_answers: correct,
      completed_at: new Date().toISOString(),
    };

    const userKey = user?.id || user?.email;
    if (userKey) {
      saveUserAttempt(userKey, attempt);
    }

    setFeedbackLoading(true);
    try {
      const wrongList = wrongTopics.length > 0 ? wrongTopics.join(', ') : 'core concepts';
      const prompt = `You are a friendly Malawi curriculum study tutor. A student completed the quiz titled "${activeQuiz.title}" in ${activeQuiz.subject} at ${activeQuiz.level} level and scored ${score}%. The questions they answered incorrectly are: ${wrongList}. Provide encouraging feedback, explain what to review next, and suggest one or two study tips.`;
      const response = await fetchAiChat(prompt);
      const feedbackText = typeof response === 'string' ? response : response?.text;
      setAiFeedback(feedbackText || `Well done! You scored ${score}%. Keep practising the topics you found harder and review your notes on ${wrongList}. You are making good progress!`);
    } catch (error) {
      console.error(error);
      setAiFeedback(`Well done! You scored ${score}%. Keep practising the topics you found harder and review your notes on ${wrongTopics.length ? wrongTopics.join(', ') : 'core concepts'}. You are making good progress!`);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const totalCorrect = submitted ? questions.filter((q, i) => answers[i] === q.answer).length : 0;
    const score = submitted && questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setActiveQuiz(null)} className="text-sm text-primary flex items-center gap-1 mb-6 hover:underline">
          ← Back to Quizzes
        </button>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEVEL_COLORS[activeQuiz.level] || "bg-muted"}`}>{activeQuiz.level}</span>
            {submitted && (
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
                <span className="font-poppins font-bold text-lg">{score}%</span>
              </div>
            )}
          </div>
          <h2 className="font-poppins text-xl font-bold text-foreground mb-1">{activeQuiz.title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{activeQuiz.subject} · {questions.length} questions</p>

          {submitted && (
            <div className={`rounded-xl p-4 mb-6 ${score >= 70 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className={`font-semibold text-sm mb-1 ${score >= 70 ? "text-emerald-700" : "text-amber-700"}`}>
                {score >= 70 ? "🎉 Well done!" : "📚 Keep studying!"}
                {" "}You scored {totalCorrect}/{questions.length} ({score}%)
              </p>
              {feedbackLoading ? (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Getting AI feedback...
                </div>
              ) : aiFeedback ? (
                <p className="text-sm text-foreground mt-2">{aiFeedback}</p>
              ) : null}
            </div>
          )}

          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={i} className="border border-border rounded-xl p-4">
                <p className="font-medium text-sm text-foreground mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || []).map((opt, j) => {
                    const isSelected = answers[i] === opt;
                    const isCorrect = submitted && opt === q.answer;
                    const isWrong = submitted && isSelected && opt !== q.answer;
                    return (
                      <button
                        key={j}
                        disabled={submitted}
                        onClick={() => setAnswers({ ...answers, [i]: opt })}
                        className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${
                          isCorrect ? "bg-emerald-50 border-emerald-400 text-emerald-700" :
                          isWrong ? "bg-red-50 border-red-400 text-red-700" :
                          isSelected ? "bg-primary/10 border-primary text-primary" :
                          "border-border hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {submitted && isCorrect && <CheckCircle className="h-4 w-4" />}
                          {submitted && isWrong && <XCircle className="h-4 w-4" />}
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!submitted ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < questions.length}
              className="mt-6 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => startQuiz(activeQuiz)}
              className="mt-6 w-full bg-muted text-foreground font-semibold py-3 rounded-xl hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" /> Quizzes
        </h1>
        <p className="text-muted-foreground">Test your knowledge with AI-powered adaptive quizzes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search quizzes..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${level === l ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No quizzes available yet.</p>
          <p className="text-muted-foreground text-sm mt-1">Interactive quizzes are coming soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((quiz) => (
              <div key={quiz.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  {(() => {
                    const levelClass = LEVEL_COLORS[quiz.level] || "bg-muted";
                    return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${levelClass}`}>{quiz.level}</span>;
                  })()}
                  {quiz.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      quiz.difficulty === "easy" ? "bg-green-100 text-green-700" :
                      quiz.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"}`}>
                      {quiz.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{quiz.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">{quiz.subject}</p>
                {quiz.topic && <p className="text-xs text-muted-foreground mb-4">Topic: {quiz.topic}</p>}
                <p className="text-xs text-muted-foreground mb-4">{(quiz.questions || []).length} questions</p>
                <button
                  onClick={() => startQuiz(quiz)}
                  className="w-full bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
          <Leaderboard />
        </div>
      )}
    </div>
  );
}