import { useEffect, useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchAnnouncements, createAnnouncement } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { markNotificationsAsRead } from '@/lib/notificationStorage';

export default function TeacherAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAnnouncements({ published: true });
      const announcementsList = Array.isArray(response) ? response : [];
      const filtered = announcementsList.filter((announcement) => {
        const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();
        return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user?.email;
      });
      setAnnouncements(filtered);
    } catch (fetchError) {
      setError(fetchError.message ?? 'Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.email) return;

    const loadAndMark = async () => {
      const response = await fetchAnnouncements({ published: true });
      const announcementsList = Array.isArray(response) ? response : [];
      const filtered = announcementsList.filter((announcement) => {
        const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();
        return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user?.email;
      });
      await loadAnnouncements();
      const announcementIds = filtered.filter((item) => item?.id).map((item) => item.id);
      if (announcementIds.length > 0) {
        markNotificationsAsRead(user.email, announcementIds);
      }
    };

    loadAndMark();
  }, [user?.email]);

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !body.trim()) {
      setError('Please enter a title and message.');
      return;
    }

    if (!user?.email) {
      setError('Teacher email is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        teacherEmail: user.email,
        targetAudience: 'students',
        isPublished: true,
      });
      setTitle('');
      setBody('');
      await loadAnnouncements();
    } catch (createError) {
      setError(createError.message ?? 'Unable to post announcement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">Post updates and notify your students</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">New announcement</h2>
              <p className="text-sm text-slate-500">Share updates, reminders, or exam schedules with your students.</p>
            </div>
            <Bell className="h-5 w-5 text-slate-500" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <textarea
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={5}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write your announcement here"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white" onClick={handleCreateAnnouncement} disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              {saving ? 'Posting...' : 'Post announcement'}
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Published announcements</h2>
              <p className="text-sm text-slate-500">These announcements were posted by you.</p>
            </div>
            <Button variant="default" className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100" onClick={loadAnnouncements} disabled={loading}>
              Refresh
            </Button>
          </div>
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading announcements…</div>
          ) : announcements.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Bell className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p className="font-medium">No announcements yet</p>
              <p className="text-sm">Create the first announcement to notify your students.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-slate-500">{announcement.teacherEmail}</p>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{announcement.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
