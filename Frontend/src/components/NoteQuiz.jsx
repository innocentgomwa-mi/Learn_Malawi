import { useState } from "react";
import { Brain, ChevronDown, CheckCircle, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { generateStudyNoteQuiz } from "@/api";

/**
 * @typedef {{ question: string; options: string[]; correct_answer: string; explanation: string }} QuizQuestion
 * @typedef {{
 *   title: string;
 *   subject: string;
 *   level: string;
 *   topic?: string;
 *   content?: string;
 *   summary?: string;
 * }} StudyNote
 */

/**
 * @param {{ note: StudyNote }} props
 */
export default function NoteQuiz({ note }) {
  const [questions, setQuestions] = useState(/** @type {QuizQuestion[]} */ ([]));
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState(/** @type {{ [key: number]: string }} */ ({}));
  const [submitted, setSubmitted] = useState(false);
  const [generated, setGenerated] = useState(false);

  const scrollToQuiz = () => {
    document.getElementById("note-quiz-section")?.scrollIntoView({ behavior: "smooth" });
    if (!generated) generateQuestions();
  };

  const generateQuestions = async () => {
    setLoading(true);
    setGenerated(true);
    setAnswers({});
    setSubmitted(false);

    try {
      const result = await generateStudyNoteQuiz(note);
      setQuestions(result?.questions || []);
    } catch (error) {
      console.error('Quiz generation failed:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => setSubmitted(true);

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setQuestions([]);
    generateQuestions();
  };

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct_answer).length
    : 0;

  return (
    <div className="mt-8">
      {/* Scroll-down CTA button */}
      <button
        onClick={scrollToQuiz}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-primary/40 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors group"
      >
        <Brain className="h-4 w-4" />
        Test Your Understanding
        <ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
      </button>

      {/* Quiz section */}
      <div id="note-quiz-section" className="mt-6">
        {!generated ? null : loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating questions for this topic…</p>
          </div>
        ) : questions.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">Could not generate questions. Please try again.</p>
        ) : (
          <div className="bg-muted/40 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-poppins font-bold text-foreground flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> Quick Quiz
              </h3>
              {submitted && (
                <div className={`font-poppins font-bold text-lg ${score >= 4 ? "text-emerald-600" : score >= 3 ? "text-amber-600" : "text-red-500"}`}>
                  {score}/{questions.length}
                </div>
              )}
            </div>

            {submitted && (
              <div className={`rounded-xl p-4 mb-6 text-sm font-medium ${score >= 4 ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : score >= 3 ? "bg-amber-50 border border-amber-200 text-amber-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                {score >= 4 ? "🎉 Excellent! You have a strong grasp of this topic." : score >= 3 ? "👍 Good effort! Review the explanations below to improve." : "📚 Keep studying! Read the note again and retry."}
              </div>
            )}

            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4">
                  <p className="font-medium text-sm text-foreground mb-3">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {(q.options || []).map((opt, j) => {
                      const isSelected = answers[i] === opt;
                      const isCorrect = submitted && opt === q.correct_answer;
                      const isWrong = submitted && isSelected && opt !== q.correct_answer;
                      return (
                        <button
                          key={j}
                          disabled={submitted}
                          onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))}
                          className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${
                            isCorrect ? "bg-emerald-50 border-emerald-400 text-emerald-700" :
                            isWrong ? "bg-red-50 border-red-400 text-red-700" :
                            isSelected ? "bg-primary/10 border-primary text-primary" :
                            "border-border hover:bg-muted"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {submitted && isCorrect && <CheckCircle className="h-4 w-4 flex-shrink-0" />}
                            {submitted && isWrong && <XCircle className="h-4 w-4 flex-shrink-0" />}
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
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
                className="mt-6 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Submit Answers
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-muted text-foreground font-semibold py-3 rounded-xl hover:bg-muted/80 transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Try New Questions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}