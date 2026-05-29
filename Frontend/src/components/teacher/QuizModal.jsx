import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { createQuiz, updateQuiz } from '@/api';
import { Sparkles, Loader2, PlusCircle } from 'lucide-react';

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
  level: 'JCE',
  subject: '',
  difficulty: 'level1',
  class: '',
  totalTime: 0,
  questions: [defaultQuestion()],
};

const GEN_LEVELS = [
  { value: 'level1', label: 'Level 1 — Beginner' },
  { value: 'level2', label: 'Level 2 — Intermediate' },
  { value: 'level3', label: 'Level 3 — Advanced' },
];

const SCHOOL_LEVELS = ['PSLC', 'JCE', 'MSCE'];

export default function QuizModal({ open, onClose, onSaved, existing }) {
  const [tab, setTab] = useState('manual');
  const [quiz, setQuiz] = useState(defaultQuiz);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Generate tab state
  const [genTopic, setGenTopic] = useState('');
  const [genSubject, setGenSubject] = useState('');
  const [genLevel, setGenLevel] = useState('level1');
  const [genSchoolLevel, setGenSchoolLevel] = useState('JCE');
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [genTitle, setGenTitle] = useState('');

  useEffect(() => {
    if (existing) {
      setQuiz({
        title: existing.title || '',
        description: existing.description || '',
        level: existing.level || existing.class_level || 'JCE',
        subject: existing.subject || '',
        difficulty: existing.difficulty || 'level1',
        class: existing.class || '',
        totalTime: existing.totalTime || existing.total_time || 0,
        questions: (existing.questions || [defaultQuestion()]).map((q) => ({
          question: q.question || '',
          options: q.options || [q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || ''],
          answer: q.answer || q.correct_answer || 'A',
          timeLimit: q.timeLimit || q.time_limit || 30,
          completionTimePerQuestion: q.completionTimePerQuestion || q.completion_time || 10,
        })),
      });
    } else {
      setQuiz(defaultQuiz);
    }
    setError('');
    setGeneratedQuestions([]);
    setGenTopic('');
    setGenTitle('');
  }, [existing, open]);

  const handleField = (field, value) => setQuiz((prev) => ({ ...prev, [field]: value }));
  const handleQuestion = (i, field, value) => setQuiz((prev) => {
    const questions = [...prev.questions];
    questions[i] = { ...questions[i], [field]: value };
    return { ...prev, questions };
  });
  const handleOption = (qi, oi, value) => setQuiz((prev) => {
    const questions = [...prev.questions];
    const options = [...questions[qi].options];
    options[oi] = value;
    questions[qi] = { ...questions[qi], options };
    return { ...prev, questions };
  });
  const addQuestion = () => setQuiz((prev) => ({ ...prev, questions: [...prev.questions, defaultQuestion()] }));
  const removeQuestion = (i) => setQuiz((prev) => ({ ...prev, questions: prev.questions.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!quiz.title.trim()) { setError('Title is required.'); return; }
    if (quiz.questions.length === 0) { setError('Add at least one question.'); return; }
    setSaving(true); setError('');
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
          timeLimit: q.timeLimit,
          completionTimePerQuestion: q.completionTimePerQuestion,
        })),
      };
      let saved = null;
      if (existing?.id) {
        saved = await updateQuiz(existing.id, payload);
      } else {
        saved = await createQuiz(payload);
      }
      onSaved?.(saved);
    } catch {
      setError('Unable to save quiz. Please try again.');
    } finally { setSaving(false); }
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) { setGenError('Please enter a topic.'); return; }
    setGenError(''); setGenerating(true); setGeneratedQuestions([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/ai/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: genTopic.trim(),
          subject: genSubject.trim() || genTopic.trim(),
          level: genLevel,
          schoolLevel: genSchoolLevel,
          topic: genTopic.trim(),
        }),
      });
      const data = await res.json();
      if (!data.questions || !Array.isArray(data.questions)) throw new Error('Invalid response');
      setGeneratedQuestions(data.questions.slice(0, genCount));
      setGenTitle(`${genTopic.trim()} — ${GEN_LEVELS.find(l => l.value === genLevel)?.label}`);
    } catch { setGenError('Failed to generate questions. Please try again.'); }
    finally { setGenerating(false); }
  };

  const handleSaveGenerated = async () => {
    if (generatedQuestions.length === 0) return;
    setSaving(true); setGenError('');
    try {
      const payload = {
        title: genTitle || genTopic,
        description: `AI generated quiz on ${genTopic}`,
        level: genSchoolLevel,
        subject: genSubject || genTopic,
        difficulty: genLevel,
        class: '',
        totalTime: 0,
        questions: generatedQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.correctAnswer || q.answer || 'A',
          timeLimit: 30,
          completionTimePerQuestion: 10,
        })),
      };
      const created = await createQuiz(payload);
      onSaved?.(created);
    } catch { setGenError('Failed to save quiz. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>{existing ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
        <DialogDescription>Build a quiz manually or let AI generate one for you.</DialogDescription>

        {!existing && (
          <div className="flex gap-2 mb-4 border-b border-border pb-3">
            <button onClick={() => setTab('manual')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
              ✏️ Manual
            </button>
            <button onClick={() => setTab('generate')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${tab === 'generate' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
              <Sparkles className="h-3.5 w-3.5" /> AI Generate
            </button>
          </div>
        )}

        {tab === 'generate' && !existing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic <span className="text-red-500">*</span></label>
              <input value={genTopic} onChange={(e) => setGenTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Algebra, Malawi History"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input value={genSubject} onChange={(e) => setGenSubject(e.target.value)}
                placeholder="e.g. Biology, Mathematics"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                <select value={genLevel} onChange={(e) => setGenLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground">
                  {GEN_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School Level</label>
                <select value={genSchoolLevel} onChange={(e) => setGenSchoolLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground">
                  {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of questions: {genCount}</label>
              <input type="range" min={3} max={15} value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>3</span><span>15</span></div>
            </div>
            {genError && <p className="text-sm text-red-500">{genError}</p>}
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4 mr-2" />Generate Questions</>}
            </Button>
            {generatedQuestions.length > 0 && (
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-medium">{generatedQuestions.length} questions generated ✓</p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Title:</label>
                    <input value={genTitle} onChange={(e) => setGenTitle(e.target.value)}
                      className="px-2 py-1 text-xs border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary text-foreground bg-background" />
                  </div>
                </div>
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="bg-muted rounded-xl p-3 text-sm">
                    <p className="font-medium mb-1">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {q.options.map((opt, j) => (
                        <p key={j} className={`text-xs px-2 py-1 rounded-lg ${(q.correctAnswer || q.answer) === String.fromCharCode(65 + j) ? 'bg-yellow-100 text-yellow-800 font-medium' : 'text-muted-foreground'}`}>
                          {opt}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                <Button onClick={handleSaveGenerated} disabled={saving} className="w-full bg-yellow-400 text-blue-950 hover:bg-yellow-300">
                  {saving ? 'Saving...' : `Save Quiz to Database (${generatedQuestions.length} questions)`}
                </Button>
              </div>
            )}
          </div>
        )}

        {(tab === 'manual' || existing) && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
                <input value={quiz.title} onChange={(e) => handleField('title', e.target.value)} placeholder="Quiz title"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input value={quiz.subject} onChange={(e) => handleField('subject', e.target.value)} placeholder="e.g. Biology"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School Level</label>
                <select value={quiz.level} onChange={(e) => handleField('level', e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground">
                  {SCHOOL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select value={quiz.difficulty} onChange={(e) => handleField('difficulty', e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground">
                  {GEN_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <input value={quiz.class} onChange={(e) => handleField('class', e.target.value)} placeholder="e.g. Form 3"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Questions ({quiz.questions.length})</p>
                <button onClick={addQuestion} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <PlusCircle className="h-3.5 w-3.5" /> Add question
                </button>
              </div>
              {quiz.questions.map((q, qi) => (
                <div key={qi} className="bg-muted rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">Question {qi + 1}</p>
                    {quiz.questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} className="text-xs text-red-500 hover:underline">Remove</button>
                    )}
                  </div>
                  <input value={q.question} onChange={(e) => handleQuestion(qi, 'question', e.target.value)} placeholder="Enter question"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary text-foreground" />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <input key={oi} value={opt} onChange={(e) => handleOption(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary text-foreground" />
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mr-2">Correct answer:</label>
                    <select value={q.answer} onChange={(e) => handleQuestion(qi, 'answer', e.target.value)}
                      className="px-2 py-1 text-xs bg-background border border-border rounded-lg outline-none text-foreground">
                      {['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : existing ? 'Save Changes' : 'Create Quiz'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
