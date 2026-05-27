// @ts-nocheck
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchCareerResources,
  createCareerResource,
  updateCareerResource,
  deleteCareerResource,
} from '@/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ExternalLink, Briefcase, GraduationCap, Award, Compass, Clock, Users, Rocket, FileText } from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Briefcase', label: 'Career' },
  { value: 'GraduationCap', label: 'University Guide' },
  { value: 'Award', label: 'Scholarship' },
  { value: 'Compass', label: 'Career Path' },
  { value: 'Clock', label: 'Time Management' },
  { value: 'Users', label: 'Networking' },
  { value: 'Rocket', label: 'Motivation' },
  { value: 'FileText', label: 'Guides & Documents' },
];

const ICON_MAP = {
  Briefcase,
  GraduationCap,
  Award,
  Compass,
  Clock,
  Users,
  Rocket,
  FileText,
};

const initialForm = {
  title: '',
  description: '',
  link: '',
  icon: 'Briefcase',
};

export default function CareerResourcesAdmin() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await fetchCareerResources();
      setResources(Array.isArray(data) ? data : data?.data ?? []);
    } catch (error) {
      console.error(error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [user]);

  const openForm = () => {
    setEditingResource(null);
    setForm(initialForm);
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditingResource(null);
    setForm(initialForm);
    setFormOpen(false);
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title || '',
      description: resource.description || '',
      link: resource.link || '',
      icon: resource.icon || 'Briefcase',
    });
    setFormOpen(true);
  };

  const handleDelete = async (resource) => {
    if (!confirm('Delete this career resource?')) return;
    try {
      await deleteCareerResource(resource.id);
      await loadResources();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      link: form.link.trim(),
      icon: form.icon,
    };

    if (!payload.title || !payload.description || !payload.link) {
      return;
    }

    setSaving(true);
    try {
      if (editingResource) {
        await updateCareerResource(editingResource.id, payload);
      } else {
        await createCareerResource(payload);
      }
      await loadResources();
      closeForm();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-jakarta font-bold">Career Resources</h1>
          <p className="text-muted-foreground text-sm mt-1">Create guides, links and career support resources for students.</p>
        </div>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 border-blue-600" onClick={openForm}>
          <Plus className="w-4 h-4 mr-2" /> Add Resource
        </Button>
      </div>

      {formOpen && (
        <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">{editingResource ? 'Edit Resource' : 'Upload New Resource'}</h2>
              <p className="text-sm text-muted-foreground">Fill in the information below so students can open the resource from the career page.</p>
            </div>
            <button type="button" onClick={closeForm} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>

          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm">
              <span>Title</span>
              <input
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Link</span>
              <input
                type="url"
                value={form.link}
                onChange={handleChange('link')}
                placeholder="https://"
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                rows={4}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Icon</span>
              <select
                value={form.icon}
                onChange={handleChange('icon')}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? 'Saving...' : editingResource ? 'Update Resource' : 'Save Resource'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>Discard</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No career resources found</p>
          <p className="text-sm mt-1">Click Add Resource to create your first entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {resources.map((resource) => {
            const Icon = ICON_MAP[resource.icon] || Briefcase;
            return (
              <div key={resource.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1">{resource.icon || 'Career'}</span>
                  <a href={resource.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> Preview link
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(resource)}
                    className="rounded-full border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition"
                  >
                    <Pencil className="w-4 h-4 inline-block mr-1" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(resource)}
                    className="rounded-full border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
