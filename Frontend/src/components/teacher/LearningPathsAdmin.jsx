// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { fetchLearningPaths, fetchStudyNotes, fetchResources, createLearningPath, updateLearningPath, deleteLearningPath } from '@/api';

const LEVELS = ["PSLC", "JCE", "MSCE"];

const generateMilestoneId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const getResourceUrl = (resource) => {
  if (!resource) return null;
  const rawUrl = resource.url || resource.fileUrl || resource.videoUrl || resource.paperUrl;
  if (!rawUrl) return null;
  return rawUrl.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${rawUrl}` : rawUrl;
};

const openResource = (resource, navigate) => {
  const url = getResourceUrl(resource);
  if (!url) return;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    if (url.startsWith(apiBase)) {
      const relative = url.slice(apiBase.length) || '/';
      navigate(relative);
    } else {
      window.location.assign(url);
    }
    return;
  }
  navigate(url);
};

const normalizeMilestones = (milestones = []) => milestones.map((milestone, index) => ({
  id: milestone.id || generateMilestoneId(),
  title: milestone.title || "",
  description: milestone.description || "",
  resource_ids: milestone.resource_ids || [],
  order: milestone.order ?? index,
}));

function MilestoneEditor({ milestones = [], resourceOptions = [], loadingResources = false, onChange }) {
  const navigate = useNavigate();
  const currentMilestones = Array.isArray(milestones) ? milestones : [];
  const add = () => onChange([...currentMilestones, { id: generateMilestoneId(), title: "", description: "", resource_ids: [], order: currentMilestones.length }]);
  const update = (i, key, val) => onChange(currentMilestones.map((m, idx) => idx === i ? { ...m, [key]: val } : m));
  const remove = (i) => onChange(currentMilestones.filter((_, idx) => idx !== i));
  const toggleResource = (i, resourceId) => onChange(currentMilestones.map((m, idx) => {
    if (idx !== i) return m;
    const selected = m.resource_ids || [];
    return {
      ...m,
      resource_ids: selected.includes(resourceId)
        ? selected.filter((id) => id !== resourceId)
        : [...selected, resourceId],
    };
  }));

  const getResourceLabel = (resource) => resource?.label || resource?.title || resource?.name || 'Resource';

  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={i} className="bg-muted rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Milestone {i + 1}</span>
            <button onClick={() => remove(i)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-4 w-4" /></button>
          </div>
          <input value={m.title} onChange={e => update(i, "title", e.target.value)}
            placeholder="Milestone title" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-2 outline-none" />
          <textarea value={m.description} onChange={e => update(i, "description", e.target.value)}
            placeholder="Description (optional)" rows={2}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none outline-none" />
          <div className="space-y-2 mt-3">
            <p className="text-sm font-semibold">Assign resources, chapters or books</p>
            <p className="text-xs text-muted-foreground">Students will complete this milestone after opening and finishing the assigned resources.</p>
            <div className="grid gap-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-background p-3 text-sm">
              {loadingResources ? (
                <p className="text-muted-foreground">Loading resources…</p>
              ) : resourceOptions.length === 0 ? (
                <p className="text-muted-foreground">No resources available yet.</p>
              ) : resourceOptions.map(resource => {
                const resourceUrl = getResourceUrl(resource);
                return (
                  <div key={resource.id} className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={m.resource_ids?.includes(resource.id)}
                        onChange={() => toggleResource(i, resource.id)}
                        className="h-4 w-4 rounded border border-border text-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                      <span>{getResourceLabel(resource)}</span>
                    </label>
                    {resourceUrl && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openResource(resource, navigate);
                        }}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Open
                      </button>
                    )}
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{resource.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 text-sm text-primary hover:underline">
        <Plus className="h-4 w-4" /> Add Milestone
      </button>
    </div>
  );
}

export default function LearningPathsAdmin() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourceOptions, setResourceOptions] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadResources = async () => {
    setLoadingResources(true);
    try {
      const [studyNotesResponse, resourcesResponse] = await Promise.all([
        fetchStudyNotes({}),
        fetchResources(),
      ]);
      const studyNotes = Array.isArray(studyNotesResponse) ? studyNotesResponse : studyNotesResponse?.data ?? [];
      const resources = Array.isArray(resourcesResponse) ? resourcesResponse : resourcesResponse?.data ?? [];
      const options = [
        ...studyNotes.map((note) => ({
          id: note.id,
          label: note.title,
          type: 'Study Note',
          fileUrl: note.fileUrl,
          url: note.url,
          subject: note.subject,
        })),
        ...resources.map((resource) => ({
          id: resource.id,
          label: resource.name || resource.title || 'Resource',
          type: resource.type || 'Resource',
          url: resource.url,
          subject: resource.subject,
        })),
      ];
      setResourceOptions(options);
    } catch (error) {
      console.error('Unable to load milestone resources:', error);
      setResourceOptions([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchLearningPaths({});
      setPaths(Array.isArray(response) ? response : response?.data ?? []);
    } catch (error) {
      console.error(error);
      setPaths([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadResources();
  }, []);

  const cleanMilestonesForSave = (milestones = []) => {
    return milestones.map(({ id, ...rest }) => ({
      ...rest,
      resource_ids: Array.isArray(rest.resource_ids) ? rest.resource_ids : [],
      order: rest.order ?? 0,
    }));
  };

  const cleanFormDataForSave = (data) => {
    const { milestones, ...rest } = data || {};
    return {
      ...rest,
      milestones: cleanMilestonesForSave(milestones),
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = cleanFormDataForSave(form.data);
      if (form.mode === "edit") {
        await updateLearningPath(form.data.id, payload);
      } else {
        await createLearningPath(payload);
      }
      setForm(null);
      await load();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this learning path?")) return;
    try {
      await deleteLearningPath(id);
      await load();
    } catch (error) {
      console.error(error);
    }
  };

  const update = (key, val) => setForm(f => ({ ...f, data: { ...f.data, [key]: val } }));

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;

  if (form) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-poppins font-bold text-foreground mb-5">{form.mode === "add" ? "Create Learning Path" : "Edit Learning Path"}</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Use the milestone section below to break this path into sequential learning steps for students.</p>
          <input value={form.data.title || ""} onChange={e => update("title", e.target.value)}
            placeholder="Path Title *" className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
          <input value={form.data.subject || ""} onChange={e => update("subject", e.target.value)}
            placeholder="Subject *" className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none" />
          <select value={form.data.level || ""} onChange={e => update("level", e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none">
            <option value="">Select Level *</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <textarea value={form.data.description || ""} onChange={e => update("description", e.target.value)}
            placeholder="Description (optional)" rows={3}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm resize-none outline-none" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Milestones</p>
            <MilestoneEditor
              milestones={form.data.milestones || []}
              resourceOptions={resourceOptions}
              loadingResources={loadingResources}
              onChange={v => update("milestones", v)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.data.title || !form.data.subject || !form.data.level}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Path
            </button>
            <button onClick={() => setForm(null)} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-muted hover:bg-border transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-poppins font-bold text-foreground">Learning Paths ({paths.length})</h2>
        <button onClick={() => setForm({ mode: "add", data: { milestones: [] } })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-opacity">
          <Plus className="h-4 w-4" /> Add Path
        </button>
      </div>
      {paths.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No learning paths yet. Create one to guide your students.</div>
      ) : (
        <div className="space-y-3">
          {paths.map(path => (
            <div key={path.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">{path.title}</p>
                <p className="text-xs text-muted-foreground">{path.subject} · {path.level} · {(path.milestones || []).length} milestone{(path.milestones || []).length === 1 ? '' : 's'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setForm({ mode: "edit", data: { ...path, milestones: normalizeMilestones(path.milestones) } })}
                  className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-border transition-colors font-medium">Manage path</button>
                <button onClick={() => handleDelete(path.id)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}