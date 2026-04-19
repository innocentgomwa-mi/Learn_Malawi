// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, FileText, PlayCircle, HelpCircle, Clock, CheckCircle, XCircle, Bell } from 'lucide-react';
import { fetchAnnouncements } from '@/api';

const resourceCards = [
  { label: 'Study Notes', key: 'notes', icon: BookOpen, color: 'bg-blue-500' },
  { label: 'Past Papers', key: 'papers', icon: FileText, color: 'bg-purple-500' },
  { label: 'Tutorials', key: 'tutorials', icon: PlayCircle, color: 'bg-orange-500' },
  { label: 'Quizzes', key: 'quizzes', icon: HelpCircle, color: 'bg-emerald-500' },
];

const statusCards = [
  { label: 'Pending Review', key: 'pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Approved', key: 'approved', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Rejected', key: 'rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function TeachersDashboardOverview() {
  const { counts, statuses } = useOutletContext();
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadAnnouncements = async () => {
      setAnnouncementsLoading(true);
      try {
        const response = await fetchAnnouncements({ published: true });
        if (!active) return;
        setAnnouncements(Array.isArray(response) ? response.slice(0, 3) : []);
      } catch {
        if (active) setAnnouncements([]);
      } finally {
        if (active) setAnnouncementsLoading(false);
      }
    };

    loadAnnouncements();
    return () => { active = false; };
  }, []);

  return (
    <>
      <section id="section-overview" className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 shrink-0">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-blue-800">
            Resources you upload are submitted as <strong>pending</strong> and will be reviewed by an admin before they are published to students. You can only edit or delete your own resources.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {resourceCards.map(({ label, key, icon: Icon, color }) => (
            <Link
              key={key}
              to={`/teacher/${key === 'notes' ? 'study-notes' : key === 'papers' ? 'past-papers' : key}`}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-jakarta font-bold text-foreground">{counts[key]}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="section-status" className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Submission Status Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statusCards.map(({ label, key, icon: Icon, color, bg }) => (
            <div key={key} className={`${bg} rounded-xl p-5 flex items-center gap-4`}>
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <p className={`text-2xl font-jakarta font-bold ${color}`}>{statuses[key]}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="section-announcements" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-slate-100 p-2 text-slate-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Active Announcements</h2>
              <p className="text-sm text-muted-foreground">Latest published announcements for your learners.</p>
            </div>
          </div>
        </div>

        {announcementsLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-slate-500">Loading active announcements…</div>
        ) : announcements.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-slate-500">No active announcements available yet.</div>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-foreground">{announcement.title}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Published</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{announcement.body || announcement.message}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(announcement.createdAt || announcement.created_at).toLocaleDateString()}</span>
                  <span>{((announcement.targetAudience || announcement.target_audience) || 'all').toString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
