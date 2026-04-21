// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BookOpen, FileText, PlayCircle, HelpCircle, Clock, CheckCircle, XCircle, Bell, ArrowRight } from 'lucide-react';
import { fetchAnnouncements } from '@/api';
import { useAuth } from '@/lib/AuthContext';

const resourceCards = [
  { label: 'Study Notes', key: 'notes', icon: BookOpen, gradient: 'from-sky-500 to-blue-600', path: '/teacher/study-notes' },
  { label: 'Past Papers', key: 'papers', icon: FileText, gradient: 'from-violet-500 to-fuchsia-600', path: '/teacher/past-papers' },
  { label: 'Tutorials', key: 'tutorials', icon: PlayCircle, gradient: 'from-orange-400 to-orange-500', path: '/teacher/tutorials' },
  { label: 'Quizzes', key: 'quizzes', icon: HelpCircle, gradient: 'from-emerald-500 to-emerald-600', path: '/teacher/quizzes' },
];

const statusCards = [
  { label: 'Pending Review', key: 'pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'Approved', key: 'approved', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'Rejected', key: 'rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
];

export default function TeachersDashboardOverview() {
  const { counts, statuses } = useOutletContext();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.full_name?.split(' ')[0] || user?.firstName || 'Teacher';

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
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/20" />
          <div className="absolute right-24 -bottom-8 h-36 w-36 rounded-full bg-white/15" />
        </div>
        <div className="relative grid gap-4 lg:grid-cols-[1.4fr_0.9fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-100/80 mb-2">Teacher Portal</p>
            <h1 className="text-3xl font-semibold tracking-tight">{greeting}, {firstName},</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/85">Manage your teacher resources from one place. Upload materials, track submissions, and keep students engaged with fresh content.</p>
            <Link
              to="/teacher/study-notes"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-black/5 transition hover:bg-emerald-50"
            >
              Upload Resource <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm border border-white/10">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-100/80">Resources</p>
              <p className="mt-3 text-3xl font-semibold">{counts.notes + counts.papers + counts.tutorials + counts.quizzes}</p>
              <p className="mt-1 text-sm text-emerald-100/85">Total teaching resources under your profile</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm border border-white/10">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-100/80">Active approvals</p>
              <p className="mt-3 text-3xl font-semibold">{statuses.approved}</p>
              <p className="mt-1 text-sm text-emerald-100/85">Approved items visible to students</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {resourceCards.map(({ label, key, icon: Icon, gradient, path }) => (
          <Link
            key={key}
            to={path}
            className="group overflow-hidden rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{counts[key]}</p>
            <p className="mt-2 text-sm text-slate-500">{label}</p>
            <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition group-hover:underline">View all <ArrowRight className="h-4 w-4" /></p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          {statusCards.map(({ label, key, icon: Icon, color, bg, border }) => (
            <div key={key} className={`${bg} ${border} rounded-3xl border p-5 flex items-center gap-4`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className={`text-3xl font-semibold ${color}`}>{statuses[key]}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Important notice</p>
              <p className="text-sm text-slate-500">Review statuses and keep your students up to date.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <span className="text-sm font-bold">i</span>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Resources you upload are submitted as <strong>pending</strong> and reviewed by an admin before being published to students. Keep your drafts clean and provide clear summaries for faster approval.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Announcements</h2>
              <p className="text-sm text-slate-500">Latest published announcements for learners and staff.</p>
            </div>
          </div>
        </div>

        {announcementsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading active announcements…</div>
        ) : announcements.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No active announcements available yet.</div>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">{announcement.title}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Published</span>
                </div>
                <p className="text-sm leading-6 text-slate-600 mb-4">{announcement.body || announcement.message}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(announcement.createdAt || announcement.created_at).toLocaleDateString()}</span>
                  <span>{((announcement.targetAudience || announcement.target_audience) || 'all').toString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
