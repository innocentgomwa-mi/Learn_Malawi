import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchQuizzes, deleteQuiz } from '@/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '@/components/teacher/StatusBadge';
import QuizModal from '@/components/teacher/QuizModal';
import { filterByTeacher, sortByLatest } from './teacherUtils';

function getOptionLabels(question) {
  if (!question) return [];
  if (Array.isArray(question.options) && question.options.length > 0) {
    return question.options.map((opt, index) => ({ label: String.fromCharCode(65 + index), value: opt }));
  }

  return ['a', 'b', 'c', 'd'].map((opt, index) => ({
    label: String.fromCharCode(65 + index),
    value: question[`option_${opt}`] ?? '',
  }));
}

export default function QuizzesAdmin() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState({ open: false, existing: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchQuizzes({ teacherEmail: user?.email });
      const filtered = filterByTeacher(data, user?.email || '');
      const sorted = sortByLatest(filtered);

      setQuizzes(sorted);
    } catch (error) {
      console.error(error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await deleteQuiz(id);
    load();
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-jakarta font-bold">Quizzes</h1>
          <p className="text-muted-foreground text-sm mt-1">Create multiple-choice quizzes to test student knowledge</p>
        </div>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 border-blue-600" onClick={() => setModal({ open: true, existing: null })}>
          <Plus className="w-4 h-4 mr-2" /> Create Quiz
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No quizzes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{q.title}</p>
                  <p className="text-xs text-muted-foreground">{q.subject} · {q.class || q.class_level || '—'} · {(q.questions?.length ?? q.total_questions ?? 0)} questions</p>
                </div>
                <StatusBadge status={q.status || 'pending'} />
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setModal({ open: true, existing: q })} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors">
                    {expanded === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {expanded === q.id && (q.questions?.length ?? 0) > 0 && (
                <div className="border-t border-border px-5 py-4 space-y-4 bg-muted/20">
                  {q.questions.map((ques, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium mb-1.5">{i + 1}. {ques.question}</p>
                      <div className="grid grid-cols-2 gap-1.5 pl-4">
                        {getOptionLabels(ques).map((opt) => (
                          <span key={opt.label} className={`text-xs px-2 py-1 rounded ${ques.answer === opt.label || ques.correct_answer === opt.label ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-muted-foreground'}`}>
                            {opt.label}. {opt.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <QuizModal
        open={modal.open}
        onClose={() => setModal({ open: false, existing: null })}
        onSaved={() => { setModal({ open: false, existing: null }); load(); }}
        existing={modal.existing}
      />
    </div>
  );
}
