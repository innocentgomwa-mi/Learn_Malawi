import { useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Brain, Search, Loader2, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import RequireAccount from "@/components/RequireAccount";
import { saveUserAttempt } from "@/lib/dashboardStorage";
import { fetchQuizzes, fetchStudentProgress, fetchAiChat, recordStudentProgress } from "@/api";
import Leaderboard from "../components/Leaderboard";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const LEVEL_COLORS = { PSLC: "bg-emerald-100 text-emerald-700", JCE: "bg-blue-100 text-blue-700", MSCE: "bg-purple-100 text-purple-700" };
const GEN_LEVELS = [
  { value: "level1", label: "Level 1", sub: "Beginner" },
  { value: "level2", label: "Level 2", sub: "Intermediate" },
  { value: "level3", label: "Level 3", sub: "Advanced" },
];

export default function Quizzes() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genSubject, setGenSubject] = useState("");
  const [genLevel, setGenLevel] = useState("level1");
  const [genSchoolLevel, setGenSchoolLevel] = useState("JCE");
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [returnToGenerate, setReturnToGenerate] = useState(false);

  const queryResult = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => fetchQuizzes({ level: level === 'All' ? undefined : level }),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: isAuthenticated,
  });

  const progressResult = useQuery({
    queryKey: ['student-progress'],
    queryFn: fetchStudentProgress,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: isAuthenticated,
  });

  const quizzes = queryResult.data || [];
  const loading = queryResult.isLoading;

  const completedQuizIds = useMemo(() => {
    const progress = progressResult.data || [];
    return new Set(progress.map((p) => String(p.quiz_id || p.quizId)).filter(Boolean));
  }, [progressResult.data]);

  const filtered = useMemo(() => quizzes.filter((q) => {
    const matchLevel = level === "All" || q.level === level;
    const matchSearch = !search || q.title?.toLowerCase().includes(search.toLowerCase()) || q.subject?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  }), [quizzes, level, search]);

  const startQuiz = (quiz, fromGenerate = false) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setAiFeedback("");
    setReturnToGenerate(fromGenerate);
  };

  const handleBackFromQuiz = () => {
    setActiveQuiz(null);
    if (returnToGenerate) { setShowGenerate(true); setReturnToGenerate(false); }
  };

  const handleAnswer = (index, option) => { if (!submitted) setAnswers((prev) => ({ ...prev, [index]: option })); };

  const handleSubmit = async () => {
    setSubmitted(true);
    const questions = activeQuiz?.questions || [];
    let score = 0;
    const wrongTopics = [];
    questions.forEach((q, i) => {
      const correct = q.correctAnswer || q.answer;
      const isCorrect = (answers[i] || "").trim().charAt(0).toUpperCase() === correct?.trim().charAt(0).toUpperCase();
      if (isCorrect) score++;
      else wrongTopics.push(q.question?.slice(0, 40));
    });
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    try {
      await recordStudentProgress({ subject: activeQuiz.subject, level: activeQuiz.level, average_score: percentage });
      saveUserAttempt({ quizId: activeQuiz.id, score: percentage, date: new Date().toISOString() });
    } catch {}
    setFeedbackLoading(true);
    try {
      const wrongList = wrongTopics.slice(0, 3).join(", ");
      const prompt = `A student completed a quiz on "${activeQuiz.title}" and scored ${percentage}%. They struggled with: ${wrongList || "none"}. Give 2-3 sentences of encouraging feedback and study tips.`;
      const response = await fetchAiChat(prompt);
      setAiFeedback(response?.text || response?.content || `Well done! You scored ${percentage}%. Keep practising topics you found harder.`);
    } catch {
      setAiFeedback(`Well done! You scored ${percentage}%. Keep practising topics you found harder.`);
    } finally { setFeedbackLoading(false); }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) { setGenError("Please enter a topic."); return; }
    setGenError(""); setGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/ai/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: genTopic.trim(), subject: genSubject.trim() || genTopic.trim(), level: genLevel, schoolLevel: genSchoolLevel, topic: genTopic.trim() }),
      });
      const data = await res.json();
      if (!data.questions || !Array.isArray(data.questions)) throw new Error('Invalid response');
      const quiz = {
        id: `ai-${Date.now()}`,
        title: `Practice: ${genTopic.trim()}`,
        subject: genSubject.trim() || genTopic.trim(),
        level: genSchoolLevel,
        difficulty: genLevel,
        questions: data.questions.slice(0, genCount),
      };
      setShowGenerate(false); setGenTopic(""); setGenSubject("");
      startQuiz(quiz, true);
    } catch (err) {
      setGenError("Failed to generate quiz. Please try again.");
      console.error("Quiz generation error:", err);
    } finally { setGenerating(false); }
  };

  if (!isAuthenticated) return <RequireAccount feature="quizzes" />;

  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const score = submitted ? questions.filter((q, i) => {
      const correct = q.correctAnswer || q.answer;
      return (answers[i] || "").trim().charAt(0).toUpperCase() === correct?.trim().charAt(0).toUpperCase();
    }).length : 0;
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="w-full px-4 py-8 max-w-3xl mx-auto">
        <button onClick={handleBackFromQuiz} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          ← {returnToGenerate ? 'Back to Generate Quiz' : 'Back to Quizzes'}
        </button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{activeQuiz.title}</h2>
          <p className="text-muted-foreground text-sm mb-2">{activeQuiz.subject} · {questions.length} questions</p>
          {submitted && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${percentage >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              <Trophy className="h-4 w-4" /> Score: {score}/{questions.length} ({percentage}%)
            </div>
          )}
        </div>
        <div className="space-y-6 mb-8">
          {questions.map((q, i) => {
            const correct = q.correctAnswer || q.answer;
            const userAns = answers[i] || "";
            const isCorrect = userAns.trim().charAt(0).toUpperCase() === correct?.trim().charAt(0).toUpperCase();
            return (
              <div key={i} className="bg-card border border-border rounded-2xl p-5">
                <p className="font-medium text-sm text-foreground mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || []).map((opt, j) => {
                    const optLabel = String.fromCharCode(65 + j);
                    const isSelected = (userAns || "").trim().charAt(0).toUpperCase() === optLabel;
                    const isCorrectOpt = correct?.trim().charAt(0).toUpperCase() === optLabel;
                    let cls = "w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ";
                    if (!submitted) cls += isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted";
                    else if (isCorrectOpt) cls += "border-emerald-400 bg-emerald-50 text-emerald-800";
                    else if (isSelected && !isCorrect) cls += "border-red-400 bg-red-50 text-red-800";
                    else cls += "border-border bg-background text-muted-foreground";
                    return (
                      <button key={j} onClick={() => handleAnswer(i, optLabel)} className={cls} disabled={submitted}>
                        <span className="font-medium mr-1">{optLabel}.</span> {opt.replace(/^[A-D]\)\s*/, '')}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">💡 {q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
        {!submitted ? (
          <button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            Submit Quiz
          </button>
        ) : (
          <div className="space-y-4">
            {feedbackLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Getting AI feedback...</div>
            ) : aiFeedback ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-foreground">🤖 {aiFeedback}</div>
            ) : null}
            <button onClick={handleBackFromQuiz}
              className="w-full flex items-center justify-center gap-2 bg-muted text-foreground font-semibold py-3 rounded-xl hover:bg-muted/80 transition-colors">
              <RotateCcw className="h-4 w-4" /> {returnToGenerate ? 'Generate Another Quiz' : 'Back to Quizzes'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" /> Quizzes
          </h1>
          <p className="text-muted-foreground">Test your knowledge with AI-powered adaptive quizzes</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
          <Sparkles className="h-4 w-4" /> Generate Quiz
        </button>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">Generate a Quiz</h2>
            <p className="text-sm text-muted-foreground mb-5">AI will create questions based on your topic and level.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Topic <span className="text-red-500">*</span></label>
                <input value={genTopic} onChange={(e) => setGenTopic(e.target.value)} placeholder="e.g. Photosynthesis, Algebra"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Subject (optional)</label>
                <input value={genSubject} onChange={(e) => setGenSubject(e.target.value)} placeholder="e.g. Biology, Mathematics"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">School Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PSLC", "JCE", "MSCE"].map((sl) => (
                    <button key={sl} onClick={() => setGenSchoolLevel(sl)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${genSchoolLevel === sl ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                      {sl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {GEN_LEVELS.map((l) => (
                    <button key={l.value} onClick={() => setGenLevel(l.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${genLevel === l.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                      {l.label}<br /><span className="font-normal text-muted-foreground">{l.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Questions: {genCount}</label>
                <input type="range" min={3} max={15} value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>3</span><span>15</span></div>
              </div>
              {genError && <p className="text-sm text-red-500">{genError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowGenerate(false); setGenError(""); }} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground">Cancel</button>
              <button onClick={handleGenerate} disabled={generating}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search quizzes..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
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
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No quizzes available yet.</p>
          <button onClick={() => setShowGenerate(true)} className="mt-4 flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">
            <Sparkles className="h-4 w-4" /> Generate one now
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((quiz) => (
              <div key={quiz.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEVEL_COLORS[quiz.level] || "bg-muted text-foreground"}`}>{quiz.level}</span>
                  {quiz.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      quiz.difficulty === "level1" || quiz.difficulty === "easy" ? "bg-green-100 text-green-700" :
                      quiz.difficulty === "level2" || quiz.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"}`}>
                      {quiz.difficulty === "level1" ? "Level 1" : quiz.difficulty === "level2" ? "Level 2" : quiz.difficulty === "level3" ? "Level 3" : quiz.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{quiz.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{quiz.subject} · {(quiz.questions || []).length} questions</p>
                {completedQuizIds.has(String(quiz.id)) && (
                  <p className="text-xs inline-flex items-center font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 mb-3">Completed</p>
                )}
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
