import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchTutorials, deleteTutorial } from '@/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, PlayCircle } from 'lucide-react';
import StatusBadge from '@/components/teacher/StatusBadge';
import ResourceModal from '@/components/teacher/ResourceModal';
import { filterByTeacher, sortByLatest } from './teacherUtils';

export default function TutorialsAdmin() {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, existing: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTutorials();
      const filtered = filterByTeacher(data, user?.email || '');
      const sorted = sortByLatest(filtered);

      setTutorials(sorted);
    } catch (error) {
      console.error(error);
      setTutorials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this tutorial?')) return;
    await deleteTutorial(id);
    load();
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-jakarta font-bold">Tutorials</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload video, animation and audio tutorials for students</p>
        </div>
        <Button onClick={() => setModal({ open: true, existing: null })}>
          <Plus className="w-4 h-4 mr-2" /> Add Tutorial
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : tutorials.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <PlayCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No tutorials yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tutorials.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-orange-600" />
                </div>
                <StatusBadge status={t.status || 'pending'} />
              </div>
              <h3 className="font-semibold text-sm mb-1 truncate">{t.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{t.subject} · {t.class || t.class_level || '—'}</p>
              <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full mb-3">{t.level || 'primary'}</span>
              {t.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.description}</p>}
              {t.videoUrl && (
                <a
                  href={t.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-foreground hover:bg-primary/10 rounded-full px-3 py-1 mb-3 transition-colors"
                >
                  <PlayCircle className="w-4 h-4" /> Watch
                </a>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button onClick={() => setModal({ open: true, existing: t })} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 transition-colors ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResourceModal
        open={modal.open}
        onClose={() => setModal({ open: false, existing: null })}
        onSaved={() => { setModal({ open: false, existing: null }); load(); }}
        type="tutorial"
        existing={modal.existing}
      />
    </div>
  );
}
