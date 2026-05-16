import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Bell, Calendar, Megaphone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRefreshRate } from '@/lib/RefreshRateContext';
import { fetchAnnouncements } from '@/api';
import { markNotificationsAsRead } from '@/lib/notificationStorage';

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const { refreshSeconds } = useRefreshRate();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAnnouncements({ published: true });
        if (!active) return;
        setAnnouncements(Array.isArray(response) ? response : []);
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError.message ?? 'Unable to load notifications.');
      } finally {
        if (active) {
          setLoading(false);
          setLastRefreshed(new Date());
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!refreshSeconds || !isAuthenticated) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await fetchAnnouncements({ published: true });
        setAnnouncements(Array.isArray(response) ? response : []);
        setLastRefreshed(new Date());
      } catch (error) {
        // keep existing announcements if refresh fails
      }
    }, refreshSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [refreshSeconds, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role?.toLowerCase();
  const filteredAnnouncements = announcements.filter((announcement) => {
    const audience = (announcement.targetAudience || announcement.target_audience || 'all').toLowerCase();

    if (role === 'teacher') {
      return audience === 'all' || audience === 'teachers' || announcement.teacherEmail === user?.email;
    }

    if (role === 'student') {
      return audience === 'all' || audience === 'students';
    }

    return audience === 'all';
  });

  useEffect(() => {
    if (!isAuthenticated || loading || error || filteredAnnouncements.length === 0) return;
    markNotificationsAsRead(user?.email, filteredAnnouncements.map((announcement) => announcement.id));
  }, [isAuthenticated, loading, error, filteredAnnouncements, user?.email]);

  return (
    <div className="w-full px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Bell className="h-4 w-4" /> Notifications
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">Announcements & updates</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Stay informed with the latest published announcements from administrators and teachers.
          </p>
          {lastRefreshed && (
            <p className="mt-3 text-xs text-muted-foreground">
              Last refreshed at {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Calendar className="h-4 w-4" /> Back to home
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading notifications…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          {error}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-primary" />
          <p className="font-medium text-foreground">No notifications right now.</p>
          <p className="mt-2">Check back later for announcements and updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <article key={announcement.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{announcement.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {announcement.teacherEmail ? `${announcement.teacherEmail} · ` : ''}
                    {new Date(announcement.createdAt || announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase text-secondary">
                  {((announcement.targetAudience || announcement.target_audience) || 'all').toString()}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <p className="text-sm leading-7 text-foreground">{announcement.body || announcement.message}</p>
                {announcement.link && (
                  <Link to={announcement.link} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
                    Open chat
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
