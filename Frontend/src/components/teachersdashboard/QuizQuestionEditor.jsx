import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const emptyQ = () => ({ question: "", options: ["", "", "", ""], answer: "", timeLimit: 30, completionTimePerQuestion: 0 });

export default function QuizQuestionEditor({ quiz, onSave, onClose }) {
  const [questions, setQuestions] = useState(quiz.questions?.length ? quiz.questions : [emptyQ()]);
  const [saving, setSaving] = useState(false);

  const update = (i, field, value) => {
    setQuestions((prev) => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const updateOption = (i, j, value) => {
    setQuestions((prev) => prev.map((q, idx) => {
      if (idx !== i) return q;
      const opts = [...q.options];
      opts[j] = value;
      return { ...q, options: opts };
    }));
  };

  const save = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSaving(false);
    onSave(questions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-poppins font-bold text-foreground">Edit Questions — {quiz.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="bg-muted/40 border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Question {i + 1}</span>
                <button onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-1 rounded hover:bg-red-100 text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={q.question}
                onChange={(e) => update(i, "question", e.target.value)}
                placeholder="Question text…"
                rows={2}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
              />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {q.options.map((opt, j) => (
                  <input key={j} value={opt} onChange={(e) => updateOption(i, j, e.target.value)}
                    placeholder={`Option ${j + 1}`}
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <select value={q.answer} onChange={(e) => update(i, "answer", e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select correct answer…</option>
                  {q.options.filter(Boolean).map((opt, j) => (
                    <option key={j} value={opt}>{opt}</option>
                  ))}
                </select>
                <input type="number" value={q.timeLimit} onChange={(e) => update(i, "timeLimit", Number(e.target.value))}
                  placeholder="Time limit (seconds)"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <input value={q.explanation} onChange={(e) => update(i, "explanation", e.target.value)}
                placeholder="Explanation (optional)"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary" />
            </div>
          ))}
          <button onClick={() => setQuestions((prev) => [...prev, emptyQ()])}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary py-3 rounded-xl text-sm transition-colors">
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>

        <div className="p-5 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 border border-border text-foreground text-sm font-medium py-2 rounded-xl hover:bg-muted">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-xl hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Save Questions"}
          </button>
        </div>
      </div>
    </div>
  );
}
