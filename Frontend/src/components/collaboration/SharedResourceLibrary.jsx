import { useState, useEffect } from 'react';
import { fetchSharedResources, createSharedResource, updateSharedResource, deleteSharedResource, uploadSharedResourceFile } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

/**
 * @typedef {{ id?: string | number; title?: string; description?: string; resource_type?: string; subject?: string; class_level?: string; file_url?: string; teacher_name?: string; teacher_email?: string; created_date?: string }} SharedResource
 */
/**
 * @typedef {{ title: string; description: string; resource_type: string; subject: string; class_level: string; file_url?: string }} SharedResourceForm
 */
const EMPTY_FORM = { title: '', description: '', resource_type: '', subject: '', class_level: '', file_url: '' };
import { Upload, FileText, Plus, Download, Search, X } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ["Study Note", "Quiz", "Past Paper", "Tutorial", "Other"];
const TYPE_COLORS = {
  "Study Note": "bg-blue-100 text-blue-700",
  "Quiz": "bg-purple-100 text-purple-700",
  "Past Paper": "bg-orange-100 text-orange-700",
  "Tutorial": "bg-teal-100 text-teal-700",
  "Other": "bg-slate-100 text-slate-700",
};

/**
 * @param {{ user?: { email?: string; full_name?: string } }} props
 */
export default function SharedResourceLibrary({ user }) {
  const [resources, setResources] = useState(/** @type {SharedResource[]} */([]));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState(/** @type {SharedResourceForm} */(EMPTY_FORM));
  const [editingResource, setEditingResource] = useState(/** @type {SharedResource | null} */(null));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      if (!user?.email) return;
      const data = await fetchSharedResources();
      setResources(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    loadResources();
  }, [user]);

  /** @param {import('react').ChangeEvent<HTMLInputElement>} e */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadSharedResourceFile(formData);
      const fileUrl = result?.file_url ? String(result.file_url).trim() : '';
      setForm(f => ({ ...f, file_url: isValidUrl(fileUrl) ? fileUrl : '' }));
    } finally {
      setUploading(false);
    }
  };

  /** @param {unknown} value */
  const isValidUrl = (value) => {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  /** @param {SharedResource} resource */
  const openEditResource = (resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title || '',
      description: resource.description || '',
      resource_type: resource.resource_type || '',
      subject: resource.subject || '',
      class_level: resource.class_level || '',
      file_url: resource.file_url || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingResource(null);
    setForm(EMPTY_FORM);
  };

  /** @param {string|number} id */
  const handleDeleteResource = async (id) => {
    await deleteSharedResource(id);
    setResources(prev => prev.filter(r => r.id !== id));
    if (editingResource?.id === id) {
      closeModal();
    }
  };

  /** @param {SharedResource} resource */
  const isOwnResource = (resource) => {
    return user?.email && resource.teacher_email === user.email;
  };

  const handleShare = async () => {
    if (!form.title || !form.resource_type) return;
    setSaving(true);
    try {
      const { file_url, ...rest } = form;
      const fileUrl = typeof file_url === 'string' ? file_url : '';
      const payload = isValidUrl(fileUrl) ? { ...rest, file_url: fileUrl.trim() } : { ...rest };
      if (import.meta.env.DEV) {
        console.debug('Shared resource payload', payload);
      }
      /** @type {SharedResource} */
      let newRes;
      if (editingResource?.id) {
        newRes = await updateSharedResource(editingResource.id, payload);
        setResources(prev => prev.map(r => r.id === newRes.id ? newRes : r));
      } else {
        newRes = await createSharedResource(payload);
        setResources(prev => [newRes, ...prev]);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.resource_type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Share Resource
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Loading resources...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No resources found</p>
          <p className="text-sm mt-1">Be the first to share something useful!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm leading-tight line-clamp-2">{r.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_COLORS[/** @type {keyof typeof TYPE_COLORS} */ (r.resource_type || 'Other')] || TYPE_COLORS['Other']}`}>
                  {r.resource_type}
                </span>
              </div>
              {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {r.subject && <Badge variant="outline" className="text-xs">{r.subject}</Badge>}
                {r.class_level && <Badge variant="outline" className="text-xs">{r.class_level}</Badge>}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div>
                  <p className="text-xs font-medium">{r.teacher_name || r.teacher_email}</p>
                  <p className="text-[10px] text-muted-foreground">{r.created_date ? format(new Date(r.created_date), 'dd MMM yyyy') : ''}</p>
                </div>
                {r.file_url && (
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <Download className="w-3 h-3" /> Download
                    </Button>
                  </a>
                )}
                {isOwnResource(r) && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEditResource(r)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => r.id && handleDeleteResource(r.id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingResource ? 'Edit Shared Resource' : 'Share a Resource'}</DialogTitle>
            <DialogDescription>Add a resource and attach a file so other teachers can access it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Form 2 Algebra Notes" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Resource Type *</Label>
                <Select value={form.resource_type} onValueChange={v => setForm(f => ({ ...f, resource_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Class Level</Label>
              <Input value={form.class_level} onChange={e => setForm(f => ({ ...f, class_level: e.target.value }))} placeholder="e.g. Form 2" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Brief description..."
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Attach File</Label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:border-emerald-400 hover:text-emerald-600 transition-colors flex-1">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : form.file_url ? 'File uploaded ✓' : 'Click to upload'}
                  <input type="file" className="sr-only" onChange={handleFileUpload} disabled={uploading} />
                </label>
                {form.file_url && <button onClick={() => setForm(f => ({ ...f, file_url: '' }))}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleShare} disabled={saving || !form.title || !form.resource_type || uploading} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? (editingResource ? 'Saving...' : 'Sharing...') : (editingResource ? 'Save Changes' : 'Share Resource')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}