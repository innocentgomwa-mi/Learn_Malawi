import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { createQuiz, updateQuiz, fetchAiGenerateQuiz } from '@/api';

/**
 * @typedef {{ question: string; options: string[]; answer: string; timeLimit: number; completionTime: number }} QuizQuestion
 * @typedef {{ title: string; description: string; level: string; subject: string; difficulty: string; class: string; totalTime: number; questions: QuizQuestion[] }} QuizFormData
 * @typedef {{
 *   id?: string; title?: string; description?: string; level?: string; class?: string;
 *   class_level?: string; subject?: string; difficulty?: string; totalTime?: number;
 *   total_time?: number;
 *   questions?: Array<{
 *     question?: string; options?: string[]; option_a?: string; option_b?: string;
 *     option_c?: string; option_d?: string; answer?: string; correct_answer?: string;
 *     timeLimit?: number; time_limit?: number; completionTime?: number; completion_time?: number;
 *     completionTimePerQuestion?: number; completion_time_per_question?: number;
 *   }>;
 * }} QuizExisting
 * @typedef {{ open: boolean; onClose: () => void; onSaved: () => void; existing?: QuizExisting }} QuizModalProps
 */

const defaultQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  answer: 'A',
  timeLimit: 30,
  completionTime: 10,
});

const defaultQuiz = {
  title: '',
  description: '',
  level: 'primary',
  subject: '',
  difficulty: 'easy',
  class: '',
  totalTime: 0,
  questions: [defaultQuestion()],
};

const difficulties = ['easy', 'medium', 'hard'];
const levels = ['primary', 'secondary', 'tertiary'];

/**
 * @param {QuizModalProps} props
 */
export default function QuizModal({ open, onClose, onSaved, existing }) {
  const [quiz, setQuiz] = useState(defaultQuiz);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);

  useEffect(() => {
    if (!existing) { setQuiz(defaultQuiz); setError(''); return; }
    setQuiz({
      title: existing.title || '',
      description: existing.description || '',
      level: existing.level || existing.class_level || 'primary',
      subject: existing.subject || '',
      difficulty: existing.difficulty || 'easy',
      class: existing.class || existing.class_level || '',
      totalTime: existing.totalTime || existing.total_time || 0,
      questions: Array.isArray(existing.questions)
        ? existing.questions.map((q) => ({
            question: q.question || '',
            options: q.options || [q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || ''],
            answer: q.answer || q.correct_answer || 'A',
            timeLimit: q.timeLimit || q.time_limit || 30,
            completionTime: q.completionTime || q.completion_time || q.completionTimePerQuestion || q.completion_time_per_question || 10,
          }))
        : [defaultQuestion()],
    });
    setError('');
  }, [existing]);

  const canSave = useMemo(() => {
    return (
      quiz.title.trim().length > 0 &&
      quiz.subject.trim().length > 0 &&
      quiz.class.trim().length > 0 &&
      quiz.questions.length > 0 &&
      quiz.questions.every((q) => q.question.trim().length > 0 && q.options.every((o) => o.trim().length > 0))
    );
  }, [quiz]);

  /** @param {keyof QuizFormData} field @param {string|number} value */
  const handleField = (field, value) => setQuiz((prev) => ({ ...prev, [field]: value }));

  /** @param {number} index @param {keyof QuizQuestion} field @param {string|number} value */
  const handleQuestionChange = (index, field, value) => {
    setQuiz((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  /** @param {number} qi @param {number} oi @param {string} value */
  const handleOptionChange = (qi, oi, value) => {
    setQuiz((prev) => {
      const questions = [...prev.questions];
      const updated = { ...questions[qi] };
      updated.options = [...updated.options];
      updated.options[oi] = value;
      questions[qi] = updated;
      return { ...prev, questions };
    });
  };

  const addQuestion = () => setQuiz((prev) => ({ ...prev, questions: [...prev.questions, defaultQuestion()] }));

  /** @param {number} index */
  const removeQuestion = (index) => {
    setQuiz((prev) => {
      const questions = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions: questions.length ? questions : [defaultQuestion()] };
    });
  };

  const generateWithAI = async () => {
    const topic = quiz.subject.trim() || quiz.title.trim();
    if (!topic) {
      setAiError('Please fill in the Subject field first so Groq knows what to generate.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const generated = await fetchAiGenerateQuiz({
        topic: `${topic}${quiz.level !== 'primary' ? ` for ${quiz.level} level students` : ''} following the Malawi curriculum`,
        numQuestions,
        difficulty: quiz.difficulty,
      });

      if (!Array.isArray(generated) || generated.length === 0) {
        setAiError('Groq returned an unexpected response. Please try again.');
        return;
      }

      // Map Groq response to our question format
      // Groq returns: { question, options: ["A) ...", "B) ...", ...], correctAnswer: "A", explanation }
      const mapped = generated.map((q) => {
        const rawOptions = Array.isArray(q.options) ? q.options : [];
        // Strip "A) " prefix if present
        const cleanOptions = rawOptions.map((o) =>
          typeof o === 'string' ? o.replace(/^[A-D]\)\s*/i, '').trim() : o
        );
        // Pad to 4 options just in case
        while (cleanOptions.length < 4) cleanOptions.push('');

        return {
          question: q.question || '',
          options: cleanOptions.slice(0, 4),
          answer: (q.correctAnswer || q.correct_answer || 'A').toString().toUpperCase().charAt(0),
          timeLimit: 30,
          completionTime: 10,
        };
      });

      setQuiz((prev) => ({ ...prev, questions: mapped }));
    } catch (err) {
      console.error(err);
      setAiError('Failed to generate questions. Check your backend is running and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSave) { setError('Please fill all required fields and ensure every question has four options.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: quiz.title,
        description: quiz.description,
        level: quiz.level,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        class: quiz.class,
        totalTime: Number(quiz.totalTime) || 0,
        questions: quiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          timeLimit: Number(q.timeLimit) || 30,
          completionTimePerQuestion: Number(q.completionTime) || 10,
        })),
      };
      if (existing?.id) { await updateQuiz(existing.id, payload); } else { await createQuiz(payload); }
      onSaved();
    } catch (err) {
      console.error(err);
      setError('Unable to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>{existing ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
        <DialogDescription>{existing ? 'Update the quiz content and questions.' : 'Set up a new quiz — fill in the details then generate questions with AI or add them manually.'}</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Title</span>
              <input value={quiz.title} onChange={(e) => handleField('title', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Quiz title" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Subject / Topic</span>
              <input value={quiz.subject} onChange={(e) => handleField('subject', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. Photosynthesis, Algebra, Chichewa" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Class</span>
              <input value={quiz.class} onChange={(e) => handleField('class', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. Form 3, Standard 7" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Total Time (minutes)</span>
              <input type="number" value={quiz.totalTime} onChange={(e) => handleField('totalTime', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="0" min="0" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Level</span>
              <select value={quiz.level} onChange={(e) => handleField('level', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400">
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Difficulty</span>
              <select value={quiz.difficulty} onChange={(e) => handleField('difficulty', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400">
                {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Description</span>
            <textarea value={quiz.description} onChange={(e) => handleField('description', e.target.value)}
              className="w-full min-h-[80px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Optional quiz description" />
          </label>

          {/* AI Generation Panel */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">Generate Questions with Groq AI</span>
            </div>
            <p className="text-xs text-emerald-700 mb-4">
              Fill in Subject and Difficulty above, then choose how many questions to generate. AI questions will replace the current questions — review and edit before saving.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-emerald-800">
                Number of questions:
                <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400">
                  {[3, 5, 8, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <button type="button" onClick={generateWithAI} disabled={aiLoading}
                className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Questions</>}
              </button>
            </div>
            {aiError && <p className="mt-3 text-xs text-red-600">{aiError}</p>}
            {!aiLoading && !aiError && quiz.questions.some(q => q.question.trim()) && (
              <p className="mt-3 text-xs text-emerald-700">✓ Questions loaded — review them below and edit if needed before saving.</p>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Questions ({quiz.questions.length})</h3>
              <Button variant="secondary" type="button" onClick={addQuestion}>Add Question</Button>
            </div>

            {quiz.questions.map((q, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <p className="text-sm font-medium">Question {index + 1}</p>
                  <Button variant="ghost" size="sm" type="button" onClick={() => removeQuestion(index)}>Remove</Button>
                </div>
                <label className="space-y-2 text-sm">
                  <span>Question</span>
                  <input value={q.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Enter the question prompt" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="space-y-2 text-sm">
                      <span>Option {String.fromCharCode(65 + oi)}</span>
                      <input value={opt} onChange={(e) => handleOptionChange(index, oi, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                    </label>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <label className="space-y-2 text-sm">
                    <span>Correct answer</span>
                    <select value={q.answer} onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400">
                      {['A', 'B', 'C', 'D'].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Time limit (seconds)</span>
                    <input type="number" value={q.timeLimit} onChange={(e) => handleQuestionChange(index, 'timeLimit', Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400" min="5" />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !canSave}>
              {saving ? 'Saving...' : existing ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
