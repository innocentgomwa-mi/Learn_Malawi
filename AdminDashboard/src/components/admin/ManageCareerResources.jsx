import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';

export default function ManageCareerResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', link: '', icon: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await apiClient.entities.CareerResource.list();
        if (mounted) setResources(list);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (file) {
        const data = new FormData();
        data.append('title', form.title);
        data.append('description', form.description);
        if (form.link) data.append('link', form.link);
        data.append('icon', form.icon || 'GraduationCap');
        data.append('guide', file);

        const token = window.localStorage.getItem('admindashboard_access_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/career-resources`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: data,
        });
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json();
        setResources((r) => [created, ...r]);
        } else {
        const created = await apiClient.entities.CareerResource.create(form);
        setResources((r) => [created, ...r]);
      }

      setForm({ title: '', description: '', link: '', icon: '' });
      setFile(null);
    } catch (err) {
      console.error('Failed to create resource', err);
      alert('Failed to create career resource');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Career Resources</h2>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-3 max-w-2xl">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="p-2 border" required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="p-2 border" required />
        <input name="link" placeholder="External link (optional)" value={form.link} onChange={handleChange} className="p-2 border" />
        <input name="icon" placeholder="Icon name (optional)" value={form.icon} onChange={handleChange} className="p-2 border" />
        <div>
          <label className="block text-sm mb-1">Upload PDF guide (optional)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
            {saving ? 'Saving...' : 'Create Resource'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-semibold mb-2">Existing Resources</h3>
        {loading ? <div>Loading...</div> : (
          <ul className="space-y-3">
            {resources.map((r) => (
              <li key={r.id} className="border p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{r.title}</div>
                    <div className="text-sm text-slate-600">{r.description}</div>
                  </div>
                  <div>
                    {r.link && <a href={r.link} target="_blank" rel="noreferrer" className="text-blue-600">Open</a>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
