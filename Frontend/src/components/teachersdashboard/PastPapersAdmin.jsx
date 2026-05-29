/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   subject: string;
 *   year?: number;
 *   level: string;
 *   markingSchemeUrl?: string;
 *   status?: string;
 *   createdAt?: string | number | Date;
 *   updatedAt?: string | number | Date;
 * }} PastPaperItem
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchPastPapers, deletePastPaper } from '@/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import StatusBadge from '@/components/teacher/StatusBadge';
import ResourceModal from '@/components/teacher/ResourceModal';
import { filterByTeacher, sortByLatest } from './teacherUtils';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function TeacherPastPapers() {
  const { user } = useAuth();
  const [papers, setPapers] = useState(/** @type {PastPaperItem[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [modal,  setModal]  = useState(/** @type {{ open: boolean; existing: PastPaperItem | null }} */ ({ open: false, existing: null }));
  const [dialog, setDialog] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPastPapers({ teacherEmail: user?.email });
      const filtered = filterByTeacher(data, user?.email || '');
      const sorted = sortByLatest(filtered);
      setPapers(sorted);
    } catch (error) {
      console.error(error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  /** @param {string} id */
  const handleDelete = (id) => {
    setDialog({ title: "Delete past paper", message: "Are you sure you want to delete this past paper? This cannot be undone.", confirmLabel: "Delete", danger: true, onConfirm: async () => { await deletePastPaper(id); load(); } });
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-jakarta font-bold">Past Papers</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload PSLC, JCE and MSCE past papers with marking schemes</p>
        </div>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 border-blue-600" onClick={() => setModal({ open: true, existing: null })}>
          <Plus className="w-4 h-4 mr-2" /> Upload Paper
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : papers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No past papers yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Title','Subject','Year','Exam Level','Marking Scheme','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {papers.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <span className="truncate max-w-[160px] block">{p.title}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.year}</td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{p.level}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.markingSchemeUrl ? '✓ Yes' : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status || 'published'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal({ open: true, existing: p })} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
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

      <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
      <ResourceModal
        open={modal.open}
        onClose={() => setModal({ open: false, existing: null })}
        onSaved={() => { setModal({ open: false, existing: null }); load(); }}
        type="pastpaper"
        existing={modal.existing}
      />
    </div>
  );
}
