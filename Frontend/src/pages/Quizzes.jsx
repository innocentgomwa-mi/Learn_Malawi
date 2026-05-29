import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { Brain, Loader2, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import RequireAccount from "@/components/RequireAccount";
import ResourcePageHero from "@/components/ResourcePageHero";
import { saveUserAttempt } from "@/lib/dashboardStorage";
import { fetchQuizzes, fetchStudentProgress, fetchAiChat, recordStudentProgress, logActivity } from "@/api";
import Leaderboard from "../components/Leaderboard";
import ResourceSearchInput from "@/components/ResourceSearchInput";
import {
  PAGE_WRAP,
  LEVEL_INFO,
  filterButtonClass,
  SEARCH_INPUT_CLASS,
  YELLOW_BUTTON_CLASS,
  YELLOW_BUTTON_MD,
  OUTLINE_BUTTON_CLASS,
  CARD_CLASS,
  SPINNER_CLASS,
} from "@/lib/resourcePageStyles";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const GEN_LEVELS = [
  { value: "level1", label: "Level 1", sub: "Beginner" },
  { value: "level2", label: "Level 2", sub: "Intermediate" },
  { value: "level3", label: "Level 3", sub: "Advanced" },
];

export default function Quizzes() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [lastSearchSignature, setLastSearchSignature] = useState("");
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
  const [searchParams] = useSearchParams();
  const selectedQuizId = searchParams.get("selected_id") || "";

  const queryResult = useQuery({
    queryKey: ['quizzes', level, search],
    queryFn: () => fetchQuizzes({
      level: level === 'All' ? undefined : level,
      search: search.trim() || undefined,
    }),
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
  const isFetching = queryResult.isFetching;

  const completedQuizIds = new Set(
    (progressResult.data || []).map((p) => String(p.quiz_id || p.quizId)).filter(Boolean),
  );

  const hasActiveFilters = Boolean(search.trim()) || level !== "All";

  useEffect(() => {
    const signature = `${search.trim()}|${level}`;
    if (signature === lastSearchSignature) return;
    if (!search.trim() && level === "All") return;

    const timer = setTimeout(() => {
      logActivity({
        action: "resource_searched",
        user_email: user?.email || "anonymous",
        user_name: user?.full_name || "",
        user_role: user?.role || "student",
        resource_title: "Quizzes",
        subject: search.trim() || "all",
        metadata: JSON.stringify({ query: search.trim(), level }),
      }).catch(() => {});
      setLastSearchSignature(signature);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, level, user?.email, user?.full_name, user?.role, lastSearchSignature]);

  const startQuiz = (quiz, fromGenerate = false) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setAiFeedback("");
    setReturnToGenerate(fromGenerate);
  };

  useEffect(() => {
    if (!selectedQuizId || quizzes.length === 0 || activeQuiz) return;
    const selectedQuiz = quizzes.find((quiz) => String(quiz.id) === String(selectedQuizId));
    if (selectedQuiz) {
      startQuiz(selectedQuiz);
    }
  }, [selectedQuizId, quizzes, activeQuiz]);

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
      if (user?.email) {
        await recordStudentProgress({
          student_email: user.email,
          entry_type: "quiz",
          quiz_id: String(activeQuiz.id || ""),
          quiz_title: activeQuiz.title,
          subject: activeQuiz.subject,
          level: activeQuiz.level,
          completed: true,
          score: percentage,
          total_questions: questions.length,
          correct_answers: score,
          topics_failed: wrongTopics.slice(0, 5),
          completed_at: new Date().toISOString(),
          average_score: percentage,
        });
      }
      saveUserAttempt(user?.email || user?.id, {
        id: `quiz-${activeQuiz.id}-${Date.now()}`,
        quiz_id: String(activeQuiz.id || ""),
        quiz_title: activeQuiz.title,
        subject: activeQuiz.subject,
        level: activeQuiz.level,
        score: percentage,
        total_questions: questions.length,
        correct_answers: score,
        completed: true,
        completed_at: new Date().toISOString(),
      });
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

  if (!isAuthenticated) return <RequireAccount resourceName="Quizzes" />;

  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const score = submitted ? questions.filter((q, i) => {
      const correct = q.correctAnswer || q.answer;
      return (answers[i] || "").trim().charAt(0).toUpperCase() === correct?.trim().charAt(0).toUpperCase();
    }).length : 0;
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className={`${PAGE_WRAP} mx-auto max-w-3xl`}>
        <div className="mb-6 rounded-2xl border border-blue-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-950">{activeQuiz.title}</h2>
          <p className="mb-2 text-sm text-blue-900/70">{activeQuiz.subject} · {questions.length} questions</p>
          {submitted && (
            <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${percentage >= 50 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              <Trophy className="h-4 w-4" /> Score: {score}/{questions.length} ({percentage}%)
            </div>
          )}
        </div>
        <div className="mb-8 space-y-6">
          {questions.map((q, i) => {
            const correct = q.correctAnswer || q.answer;
            const userAns = answers[i] || "";
            return (
              <div key={i} className={`${CARD_CLASS} p-5`}>
                <p className="mb-3 text-sm font-medium text-blue-950">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || []).map((opt, j) => {
                    const optLabel = String.fromCharCode(65 + j);
                    const isSelected = (userAns || "").trim().charAt(0).toUpperCase() === optLabel;
                    const isCorrectOpt = correct?.trim().charAt(0).toUpperCase() === optLabel;
                    let cls = "w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-all ";
                    if (!submitted) cls += isSelected ? "border-yellow-400 bg-yellow-100/80 text-blue-950" : "border-blue-100 bg-white hover:bg-blue-50";
                    else if (isCorrectOpt) cls += "border-yellow-400 bg-yellow-50 text-yellow-800";
                    else if (isSelected && !isCorrectOpt) cls += "border-red-400 bg-red-50 text-red-800";
                    else cls += "border-blue-100 bg-white text-blue-900/60";
                    return (
                      <button key={j} type="button" onClick={() => handleAnswer(i, optLabel)} className={cls} disabled={submitted}>
                        <span className="mr-1 font-medium">{optLabel}.</span> {opt.replace(/^[A-D]\)\s*/, '')}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900/80">💡 {q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className={`${YELLOW_BUTTON_CLASS} w-full py-3 disabled:opacity-50`}
          >
            Submit Quiz
          </button>
        ) : (
          <div className="space-y-4">
            {feedbackLoading ? (
              <div className="flex items-center gap-2 text-sm text-blue-900/70"><Loader2 className="h-4 w-4 animate-spin text-yellow-500" /> Getting AI feedback...</div>
            ) : aiFeedback ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">🤖 {aiFeedback}</div>
            ) : null}
            <button type="button" onClick={handleBackFromQuiz} className={`${OUTLINE_BUTTON_CLASS} w-full py-3`}>
              <RotateCcw className="h-4 w-4" /> {returnToGenerate ? 'Generate Another Quiz' : 'Back to Quizzes'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={Brain}
        title="Quizzes"
        subtitle="Test your knowledge with AI-powered adaptive quizzes"
      />

      <div className={`${CARD_CLASS} mb-8 overflow-hidden border-yellow-300/60 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 text-white`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 shrink-0 text-yellow-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
                AI Quiz Generator
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Create a custom practice quiz</h2>
            <p className="mt-1 max-w-xl text-sm text-blue-100/90">
              Enter any topic and school level — AI will build questions for you to practise instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGenerate(true)}
            className={`${YELLOW_BUTTON_MD} shrink-0`}
          >
            <Sparkles className="h-4 w-4" /> Generate Quiz
          </button>
        </div>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-white p-6 shadow-2xl">
            <h2 className="mb-1 text-lg font-bold text-blue-950">Generate a Quiz</h2>
            <p className="mb-5 text-sm text-blue-900/70">AI will create questions based on your topic and level.</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-blue-950">Topic <span className="text-red-500">*</span></label>
                <input value={genTopic} onChange={(e) => setGenTopic(e.target.value)} placeholder="e.g. Photosynthesis, Algebra"
                  className={SEARCH_INPUT_CLASS} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-blue-950">Subject (optional)</label>
                <input value={genSubject} onChange={(e) => setGenSubject(e.target.value)} placeholder="e.g. Biology, Mathematics"
                  className={SEARCH_INPUT_CLASS} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-blue-950">School Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PSLC", "JCE", "MSCE"].map((sl) => (
                    <button key={sl} type="button" onClick={() => setGenSchoolLevel(sl)} className={filterButtonClass(genSchoolLevel === sl)}>
                      {sl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-blue-950">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {GEN_LEVELS.map((l) => (
                    <button key={l.value} type="button" onClick={() => setGenLevel(l.value)} className={filterButtonClass(genLevel === l.value)}>
                      {l.label}<br /><span className="font-normal opacity-80">{l.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-950 mb-1">Questions: {genCount}</label>
                <input type="range" min={3} max={15} value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} className="w-full accent-yellow-500" />
                <div className="mt-1 flex justify-between text-xs text-blue-900/70"><span>3</span><span>15</span></div>
              </div>
              {genError && <p className="text-sm text-red-500">{genError}</p>}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => { setShowGenerate(false); setGenError(""); }} className={`${OUTLINE_BUTTON_CLASS} flex-1 py-2.5`}>Cancel</button>
              <button type="button" onClick={handleGenerate} disabled={generating} className={`${YELLOW_BUTTON_CLASS} flex-1 py-2.5 disabled:opacity-50`}>
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <ResourceSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, subject, or tag..."
          ariaLabel="Search quizzes"
          isFetching={isFetching}
          isLoading={loading}
          className="relative min-w-0 flex-1"
        />
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l} type="button" onClick={() => setLevel(l)} className={filterButtonClass(level === l)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className={SPINNER_CLASS} /></div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border border-blue-200/80 bg-white py-20 text-center">
          <Brain className="mx-auto mb-4 h-12 w-12 text-blue-400" />
          <p className="font-medium text-blue-950">
            {hasActiveFilters ? "No quizzes match your search." : "No quizzes available yet."}
          </p>
          <p className="mt-1 text-sm text-blue-900/70">
            {hasActiveFilters ? "Try a different keyword or clear your filters." : "Generate a quiz or check back later."}
          </p>
          {!hasActiveFilters && (
            <button type="button" onClick={() => setShowGenerate(true)} className={`${YELLOW_BUTTON_MD} mx-auto mt-4`}>
              <Sparkles className="h-4 w-4" /> Generate one now
            </button>
          )}
        </div>
      ) : (
        <div className="mb-8 space-y-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className={`${CARD_CLASS} p-5`}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${LEVEL_INFO[quiz.level]?.color || "bg-blue-50 text-blue-800 border border-blue-200"}`}>{quiz.level}</span>
                  {quiz.difficulty && (
                    <span className="rounded-full border border-yellow-200 bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      {quiz.difficulty === "level1" ? "Level 1" : quiz.difficulty === "level2" ? "Level 2" : quiz.difficulty === "level3" ? "Level 3" : quiz.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="mb-1 font-semibold text-blue-950">{quiz.title}</h3>
                <p className="mb-4 text-xs text-blue-900/70">{quiz.subject} · {(quiz.questions || []).length} questions</p>
                {completedQuizIds.has(String(quiz.id)) && (
                  <p className="mb-3 inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Completed</p>
                )}
                <button type="button" onClick={() => startQuiz(quiz)} className={`${YELLOW_BUTTON_CLASS} w-full py-2.5`}>
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
