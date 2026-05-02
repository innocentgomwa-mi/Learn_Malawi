import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchStudyNotes, deleteStudyNote } from '@/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import StatusBadge from '@/components/teacher/StatusBadge';
import ResourceModal from '@/components/teacher/ResourceModal';
import { filterByTeacher, sortByLatest } from './teacherUtils';

export default function StudyNotesAdmin() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, existing: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStudyNotes({ teacherEmail: user?.email });
      const filtered = filterByTeacher(data, user?.email || '');
      const sorted = sortByLatest(filtered);

      setNotes(sorted);
    } catch (error) {
      console.error(error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this study note?')) return;
    await deleteStudyNote(id);
    load();
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-jakarta font-bold">Study Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload curriculum-aligned notes for students</p>
        </div>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 border-blue-600" onClick={() => setModal({ open: true, existing: null })}>
          <Plus className="w-4 h-4 mr-2" /> Upload Note
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : notes.length === 0 ? (
        <EmptyState label="study notes" />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Title','Subject','Level','Grade','Status','Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notes.map((n) => (
                <tr key={n.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate max-w-[180px]">{n.title}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{n.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground">{n.level}</td>
                  <td className="px-4 py-3 text-muted-foreground">{n.grade || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={n.status || 'published'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal({ open: true, existing: n })} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ResourceModal
        open={modal.open}
        onClose={() => setModal({ open: false, existing: null })}
        onSaved={() => { setModal({ open: false, existing: null }); load(); }}
        type="studynote"
        existing={modal.existing}
      />
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p className="font-medium">No {label} yet</p>
      <p className="text-sm mt-1">Click "Upload" to add your first resource</p>
    </div>
  );
}
