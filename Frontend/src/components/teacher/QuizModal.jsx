import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { createQuiz, updateQuiz } from '@/api';

/**
 * @typedef {{ question: string; options: string[]; answer: string; timeLimit: number; completionTimePerQuestion: number }} QuizQuestion
 * @typedef {{ title: string; description: string; level: string; subject: string; difficulty: string; class: string; totalTime: number; questions: QuizQuestion[] }} QuizFormData
 * @typedef {{
 *   id?: string;
 *   title?: string;
 *   description?: string;
 *   level?: string;
 *   class?: string;
 *   class_level?: string;
 *   subject?: string;
 *   difficulty?: string;
 *   totalTime?: number;
 *   total_time?: number;
 *   questions?: Array<{
 *     question?: string;
 *     options?: string[];
 *     option_a?: string;
 *     option_b?: string;
 *     option_c?: string;
 *     option_d?: string;
 *     answer?: string;
 *     correct_answer?: string;
 *     timeLimit?: number;
 *     time_limit?: number;
 *     completionTimePerQuestion?: number;
 *     completion_time?: number;
 *   }>;
 * }} QuizExisting
 * @typedef {{ open: boolean; onClose: () => void; onSaved: () => void; existing?: QuizExisting }} QuizModalProps
 */

const defaultQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  answer: 'A',
  timeLimit: 30,
  completionTimePerQuestion: 10,
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

  useEffect(() => {
    if (!existing) {
      setQuiz(defaultQuiz);
      setError('');
      return;
    }

    setQuiz({
      title: existing.title || '',
      description: existing.description || '',
      level: existing.level || existing.class_level || 'primary',
      subject: existing.subject || '',
      difficulty: existing.difficulty || 'easy',
      class: existing.class || existing.class_level || '',
      totalTime: existing.totalTime || existing.total_time || 0,
      questions: Array.isArray(existing.questions)
        ? existing.questions.map((question) => ({
            question: question.question || '',
            options: question.options || [question.option_a || '', question.option_b || '', question.option_c || '', question.option_d || ''],
            answer: question.answer || question.correct_answer || 'A',
            timeLimit: question.timeLimit || question.time_limit || 30,
            completionTimePerQuestion: question.completionTimePerQuestion || question.completion_time || 10,
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
      quiz.questions.every((question) => question.question.trim().length > 0 && question.options.every((option) => option.trim().length > 0))
    );
  }, [quiz]);

  /** @param {keyof QuizFormData} field @param {string|number} value */
  const handleField = (field, value) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  /** @param {number} index @param {keyof QuizQuestion} field @param {string|number} value */
  const handleQuestionChange = (index, field, value) => {
    setQuiz((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  /** @param {number} questionIndex @param {number} optionIndex @param {string} value */
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuiz((prev) => {
      const questions = [...prev.questions];
      const updated = { ...questions[questionIndex] };
      updated.options = [...updated.options];
      updated.options[optionIndex] = value;
      questions[questionIndex] = updated;
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, defaultQuestion()] }));
  };

  /** @param {number} index */
  const removeQuestion = (index) => {
    setQuiz((prev) => {
      const questions = prev.questions.filter((_, qIndex) => qIndex !== index);
      return { ...prev, questions: questions.length ? questions : [defaultQuestion()] };
    });
  };

  /**
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSave) {
      setError('Please fill all required fields and ensure every question has four options.');
      return;
    }

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
        questions: quiz.questions.map((question) => ({
          question: question.question,
          options: question.options,
          answer: question.answer,
          timeLimit: Number(question.timeLimit) || 30,
          completionTimePerQuestion: Number(question.completionTimePerQuestion) || 10,
        })),
      };

      if (existing?.id) {
        await updateQuiz(existing.id, payload);
      } else {
        await createQuiz(payload);
      }

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
      <DialogContent className="max-w-4xl max-h-[calc(100vh-6rem)] overflow-y-auto">
        <DialogTitle>{existing ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
        <DialogDescription>{existing ? 'Update the quiz content and questions.' : 'Set up a new quiz with multiple-choice questions.'}</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Title</span>
              <input
                value={quiz.title}
                onChange={(event) => handleField('title', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Quiz title"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Subject</span>
              <input
                value={quiz.subject}
                onChange={(event) => handleField('subject', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Subject or topic"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Class</span>
              <input
                value={quiz.class}
                onChange={(event) => handleField('class', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Class level"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Total Time (minutes)</span>
              <input
                type="number"
                value={quiz.totalTime}
                onChange={(event) => handleField('totalTime', Number(event.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="0"
                min="0"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Level</span>
              <select
                value={quiz.level}
                onChange={(event) => handleField('level', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Difficulty</span>
              <select
                value={quiz.difficulty}
                onChange={(event) => handleField('difficulty', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={quiz.description}
              onChange={(event) => handleField('description', event.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Optional quiz description"
            />
          </label>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Questions</h3>
              <Button variant="secondary" type="button" onClick={addQuestion}>
                Add Question
              </Button>
            </div>

            {quiz.questions.map((question, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <p className="text-sm font-medium">Question {index + 1}</p>
                  <Button variant="ghost" size="sm" type="button" onClick={() => removeQuestion(index)}>
                    Remove
                  </Button>
                </div>
                <label className="space-y-2 text-sm">
                  <span>Question</span>
                  <input
                    value={question.question}
                    onChange={(event) => handleQuestionChange(index, 'question', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter the question prompt"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="space-y-2 text-sm">
                      <span>Option {String.fromCharCode(65 + optIndex)}</span>
                      <input
                        value={option}
                        onChange={(event) => handleOptionChange(index, optIndex, event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      />
                    </label>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <label className="space-y-2 text-sm">
                    <span>Correct answer</span>
                    <select
                      value={question.answer}
                      onChange={(event) => handleQuestionChange(index, 'answer', event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {['A', 'B', 'C', 'D'].map((optionLabel) => (
                        <option key={optionLabel} value={optionLabel}>{optionLabel}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Time limit (seconds)</span>
                    <input
                      type="number"
                      value={question.timeLimit}
                      onChange={(event) => handleQuestionChange(index, 'timeLimit', Number(event.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                      min="5"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !canSave}>
              {saving ? 'Saving...' : existing ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
