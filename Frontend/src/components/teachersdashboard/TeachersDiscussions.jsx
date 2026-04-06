import { useEffect, useState } from 'react';
import { MessageSquare, Plus, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchDiscussions, createDiscussion } from '@/api';
import { useAuth } from '@/lib/AuthContext';

export default function TeacherDiscussions() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadThreads = async () => {
    setLoading(true);
    setError(null);

    try {
      const teacherEmail = user?.email;
      const response = await fetchDiscussions({ teacherEmail });
      setThreads(Array.isArray(response) ? response : []);
    } catch (fetchError) {
      setError(fetchError.message ?? 'Unable to load discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [user?.email]);

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      setError('Please enter both title and description.');
      return;
    }

    if (!user?.email) {
      setError('Teacher email is required to create a discussion.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createDiscussion({
        title: newTitle.trim(),
        body: newBody.trim(),
        teacherEmail: user.email,
      });
      setNewTitle('');
      setNewBody('');
      await loadThreads();
    } catch (createError) {
      setError(createError.message ?? 'Unable to create discussion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discussions / Q&A</h1>
          <p className="text-muted-foreground text-sm mt-1">Answer student questions and moderate discussion threads.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Create new thread</h2>
                <p className="text-sm text-slate-500">Use this to post announcements, explain study topics, or answer student questions.</p>
              </div>
              <UploadCloud className="h-5 w-5 text-slate-500" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Enter thread title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={5}
                  value={newBody}
                  onChange={(event) => setNewBody(event.target.value)}
                  placeholder="Write the discussion thread content here"
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button onClick={handleCreateThread} disabled={saving}>
                <Plus className="mr-2 h-4 w-4" />
                {saving ? 'Creating...' : 'Create thread'}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Active discussion threads</h2>
                <p className="text-sm text-slate-500">Threads created by you appear below.</p>
              </div>
              <Button variant="secondary" onClick={loadThreads} disabled={loading}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">Loading discussions…</div>
            ) : threads.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p className="font-medium">No discussions yet</p>
                <p className="text-sm">Create the first thread to start the conversation.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {threads.map((thread) => (
                  <li key={thread.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold">{thread.title}</h3>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{thread.comments?.length ?? 0} comments</p>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{thread.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
