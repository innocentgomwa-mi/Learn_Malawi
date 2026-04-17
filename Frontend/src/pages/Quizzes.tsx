/**
 * @typedef {{ question: string, options: string[], answer: string, explanation: string }} QuizQuestion
 * @typedef {{ id: string, title: string, subject: string, level: 'PSLC' | 'JCE' | 'MSCE', difficulty: string, topic?: string, questions: QuizQuestion[] }} Quiz
 */

import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Brain, Search, CheckCircle, XCircle, Loader2, RotateCcw, Trophy, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { saveUserAttempt } from "@/lib/dashboardStorage";
import { fetchQuizzes, fetchAiChat, fetchAiGenerateQuiz } from "@/api";
import Leaderboard from "../components/Leaderboard";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type Quiz = {
  id: string | number;
  title: string;
  subject: string;
  level: 'PSLC' | 'JCE' | 'MSCE';
  difficulty: string;
  topic?: string;
  questions: QuizQuestion[];
};

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const LEVEL_COLORS = { PSLC: "bg-emerald-100 text-emerald-700", JCE: "bg-blue-100 text-blue-700", MSCE: "bg-purple-100 text-purple-700" };

export default function Quizzes() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [genCount, setGenCount] = useState(5);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");

  const { data: quizzes = [], isLoading: loading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => fetchQuizzes({ level: level === 'All' ? undefined : level, subject: search }),
    staleTime: 1000 * 60,
    retry: 1,
  });

  const filtered = quizzes.filter((q: Quiz) => {
    const matchLevel = level === "All" || q.level === level;
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.subject?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const startQuiz = (quiz: Quiz) => { setActiveQuiz(quiz); setAnswers({}); setSubmitted(false); setAiFeedback(""); };

  const generateSelfTest = async () => {
    if (!genTopic.trim()) { setGenError("Please enter a topic first."); return; }
    setGenLoading(true); setGenError("");
    try {     
      const generated = await fetchAiGenerateQuiz({
        topic: genTopic.trim() + " following the Malawi school curriculum",
        numQuestions: genCount,
        difficulty: genDifficulty,
      });
      if (!Array.isArray(generated) || generated.length === 0) {
        setGenError("Groq returned an unexpected response. Please try again."); return;
      }
      const questions = generated.map((q) => {
        const rawOptions = Array.isArray(q.options) ? q.options : [] as unknown[];
        const cleanOptions = rawOptions.map((o: unknown) => typeof o === "string" ? o.replace(/^[A-D]\)\s*/i, "").trim() : String(o));
        while (cleanOptions.length < 4) cleanOptions.push("");
        return {
          question: q.question || "",
          options: cleanOptions.slice(0, 4),
          answer: (q.correctAnswer || q.correct_answer || "A").toString().toUpperCase().charAt(0),
          explanation: q.explanation || "",
        };
      });
      setGeneratorOpen(false);
      startQuiz({ id: "ai-" + Date.now(), title: "Practice: " + genTopic.trim(), subject: genTopic.trim(), level: "JCE", difficulty: genDifficulty, questions });
    } catch (err) {
      console.error(err); setGenError("Failed to generate quiz. Make sure the backend is running.");
    } finally { setGenLoading(false); }
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitted(true);
    const questions = activeQuiz.questions || [];
    let correct = 0; 
    const wrongTopics: string[] = [];
    questions.forEach((q: QuizQuestion, i: number) => { 
      if (answers[i] === q.answer) { 
        correct++; 
      } else { 
        const s = q.question?.slice(0, 60); 
        if (s) wrongTopics.push(s); 
      } 
    });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const activeQuizId = String(activeQuiz.id);
    if (!activeQuizId.startsWith("ai-")) {
      const attempt = { id: activeQuizId + "-" + Date.now(), quiz_id: activeQuizId, quiz_title: activeQuiz.title, subject: activeQuiz.subject, level: activeQuiz.level, score, total_questions: questions.length, correct_answers: correct, completed_at: new Date().toISOString() };
      const userKey = user?.id || user?.email;
      if (userKey) saveUserAttempt(userKey, attempt);
    }
    setFeedbackLoading(true);
    try {
      const wrongList = wrongTopics.length > 0 ? wrongTopics.join("; ") : "none — perfect score!";
      const prompt = "You are a warm and encouraging Malawi curriculum tutor. A student finished a quiz.\n\nQuiz: \"" + activeQuiz.title + "\" | Subject: " + activeQuiz.subject + " | Score: " + score + "%\nQuestions answered incorrectly: " + wrongList + "\n\nWrite short friendly feedback (4-6 sentences): celebrate their score, explain what to revisit, give one study tip for the Malawi curriculum, end with a motivating line. No bullet points.";
      const response = await fetchAiChat(prompt);
      const feedbackText = response?.content || response?.text || (typeof response === "string" ? response : null);
      setAiFeedback(feedbackText || "Well done! You scored " + score + "%. Keep practising and you will keep improving!");
    } catch (err) { console.error(err); setAiFeedback("Well done! You scored " + score + "%. Keep practising!"); }
    finally { setFeedbackLoading(false); }
  };

  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const totalCorrect = submitted ? questions.filter((q: QuizQuestion, i: number) => answers[i] === q.answer).length : 0;
    const score = submitted && questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;
    const isAI = String(activeQuiz.id).startsWith("ai-");
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setActiveQuiz(null)} className="text-sm text-primary flex items-center gap-1 mb-6 hover:underline">← Back to Quizzes</button>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isAI
                ? <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-violet-100 text-violet-700"><Sparkles className="h-3 w-3" /> AI Practice</span>
                : <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (LEVEL_COLORS[activeQuiz.level] || "bg-muted")}>{activeQuiz.level}</span>
              }
            </div>
            {submitted && <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-secondary" /><span className="font-poppins font-bold text-lg">{score}%</span></div>}
          </div>
          <h2 className="font-poppins text-xl font-bold text-foreground mb-1">{activeQuiz.title}</h2>
          <p className="text-muted-foreground text-sm mb-6">{activeQuiz.subject} · {questions.length} questions · {activeQuiz.difficulty}</p>
          {submitted && (
            <div className={"rounded-xl p-4 mb-6 " + (score >= 70 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200")}>
              <p className={"font-semibold text-sm mb-1 " + (score >= 70 ? "text-emerald-700" : "text-amber-700")}>
                {score >= 70 ? "🎉 Well done!" : "📚 Keep studying!"} You scored {totalCorrect}/{questions.length} ({score}%)
              </p>
              {feedbackLoading
                ? <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Getting AI feedback...</div>
                : aiFeedback ? <p className="text-sm text-foreground mt-2">{aiFeedback}</p> : null}
            </div>
          )}
          <div className="space-y-6">
            {questions.map((q: QuizQuestion, i: number) => (
              <div key={i} className="border border-border rounded-xl p-4">
                <p className="font-medium text-sm text-foreground mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || []).map((opt: string, j: number) => {
                    const optLabel = String.fromCharCode(65 + j);
                    const isSelected = answers[i] === optLabel;
                    const isCorrect = submitted && optLabel === q.answer;
                    const isWrong = submitted && isSelected && optLabel !== q.answer;
                    return (
                      <button key={j} disabled={submitted} onClick={() => setAnswers({ ...answers, [i]: optLabel })}
                        className={"w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all " + (isCorrect ? "bg-emerald-50 border-emerald-400 text-emerald-700" : isWrong ? "bg-red-50 border-red-400 text-red-700" : isSelected ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted")}>
                        <span className="flex items-center gap-2">
                          {submitted && isCorrect && <CheckCircle className="h-4 w-4" />}
                          {submitted && isWrong && <XCircle className="h-4 w-4" />}
                          <span className="font-medium mr-1">{optLabel}.</span> {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">💡 {q.explanation}</div>}
              </div>
            ))}
          </div>
          {!submitted ? (
            <button onClick={submitQuiz} disabled={Object.keys(answers).filter(k => answers[k]).length < questions.length}
              className="mt-6 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
              Submit Quiz
            </button>
          ) : (
            <div className="mt-6 flex gap-3">
              <button onClick={() => startQuiz(activeQuiz)} className="flex-1 bg-muted text-foreground font-semibold py-3 rounded-xl hover:bg-muted/80 flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> Try Again
              </button>
              {isAI && (
                <button onClick={() => { setActiveQuiz(null); setGeneratorOpen(true); }}
                  className="flex-1 bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" /> Generate New
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 flex items-center gap-2"><Brain className="h-8 w-8 text-primary" /> Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge or generate a personal practice test with AI</p>
      </div>

      <div className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 overflow-hidden">
        <button onClick={() => setGeneratorOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-violet-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 text-white rounded-xl p-2"><Sparkles className="h-4 w-4" /></div>
            <div className="text-left">
              <p className="font-semibold text-violet-900 text-sm">Generate a Practice Quiz</p>
              <p className="text-violet-600 text-xs">Type any topic and Groq AI will create a quiz just for you</p>
            </div>
          </div>
          {generatorOpen ? <ChevronUp className="h-4 w-4 text-violet-500" /> : <ChevronDown className="h-4 w-4 text-violet-500" />}
        </button>
        {generatorOpen && (
          <div className="px-5 pb-5 border-t border-violet-200">
            <div className="grid gap-4 sm:grid-cols-3 mt-4">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-violet-900 mb-1">Topic</label>
                <input value={genTopic} onChange={(e) => { setGenTopic(e.target.value); setGenError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && generateSelfTest()}
                  placeholder="e.g. Photosynthesis, World War II, Algebra, Chichewa Grammar..."
                  className="w-full rounded-xl border border-violet-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-900 mb-1">Difficulty</label>
                <select value={genDifficulty} onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-violet-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-900 mb-1">Number of questions</label>
                <select value={genCount} onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-violet-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="3">3 questions</option><option value="5">5 questions</option><option value="8">8 questions</option><option value="10">10 questions</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={generateSelfTest} disabled={genLoading}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm">
                  {genLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Start Practice Quiz</>}
                </button>
              </div>
            </div>
            {genError && <p className="mt-3 text-xs text-red-600">{genError}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search quizzes..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={"px-4 py-2.5 rounded-xl text-sm font-medium transition-all " + (level === l ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted")}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No quizzes available yet.</p>
          <p className="text-muted-foreground text-sm mt-1">Try generating a practice quiz with AI above!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((quiz: Quiz) => (
              <div key={quiz.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (LEVEL_COLORS[quiz.level] || "bg-muted")}>{quiz.level}</span>
                  {quiz.difficulty && (
                    <span className={"text-xs px-2 py-1 rounded-full font-medium " + (quiz.difficulty === "easy" ? "bg-green-100 text-green-700" : quiz.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                      {quiz.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{quiz.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">{quiz.subject}</p>
                {quiz.topic && <p className="text-xs text-muted-foreground mb-4">Topic: {quiz.topic}</p>}
                <p className="text-xs text-muted-foreground mb-4">{(quiz.questions || []).length} questions</p>
                <button onClick={() => startQuiz(quiz)} className="w-full bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity">
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
