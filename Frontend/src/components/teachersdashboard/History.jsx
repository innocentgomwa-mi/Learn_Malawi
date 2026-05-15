// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Clock, BookOpen, FileText, PlayCircle, HelpCircle, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes, fetchAttendanceRecords } from '@/api';

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const extractTitle = (item, defaultLabel) => {
  return item?.title || item?.name || item?.subject || item?.topic || item?.description || defaultLabel;
};

const createHistoryEntry = (source, item) => {
  const timestamp = item?.updatedAt || item?.createdAt || item?.created_at || item?.updated_at || item?.date;
  return {
    id: `${source}-${item?.id}-${timestamp || 'unknown'}`,
    source,
    title: extractTitle(item, source),
    date: formatDate(timestamp),
    details: item?.status || item?.class || item?.difficulty || item?.message || '',
  };
};

export default function History() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const teacherEmail = user?.email || '';

  useEffect(() => {
    let active = true;

    const loadTeacherHistory = async () => {
      if (!teacherEmail) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [notes, papers, tutorials, quizzes, attendance] = await Promise.all([
          fetchStudyNotes({ teacherEmail }),
          fetchPastPapers({ teacherEmail }),
          fetchTutorials({ teacherEmail }),
          fetchQuizzes({ teacherEmail }),
          fetchAttendanceRecords({ teacherEmail }),
        ]);

        const allItems = [
          ...(Array.isArray(notes) ? notes : []),
          ...(Array.isArray(papers) ? papers : []),
          ...(Array.isArray(tutorials) ? tutorials : []),
          ...(Array.isArray(quizzes) ? quizzes : []),
          ...(Array.isArray(attendance) ? attendance : []),
        ];

        const history = [
          ...(Array.isArray(notes) ? notes.map((item) => createHistoryEntry('Study Note', item)) : []),
          ...(Array.isArray(papers) ? papers.map((item) => createHistoryEntry('Past Paper', item)) : []),
          ...(Array.isArray(tutorials) ? tutorials.map((item) => createHistoryEntry('Tutorial', item)) : []),
          ...(Array.isArray(quizzes) ? quizzes.map((item) => createHistoryEntry('Quiz', item)) : []),
          ...(Array.isArray(attendance) ? attendance.map((item) => createHistoryEntry('Attendance', item)) : []),
        ];

        if (active) {
          setItems(history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (error) {
        console.error('Unable to load teacher history', error);
        if (active) {
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTeacherHistory();
    return () => { active = false; };
  }, [teacherEmail]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      resources: items.filter((item) => item.source !== 'Attendance').length,
      attendance: items.filter((item) => item.source === 'Attendance').length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Teacher History</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Activity timeline for your account</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Track items you've created or updated, including resources, quizzes, and attendance records.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-800 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total items</p>
              <p className="mt-3 text-3xl font-semibold">{summary.total}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-800 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Resources</p>
              <p className="mt-3 text-3xl font-semibold">{summary.resources}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-800 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Attendance</p>
              <p className="mt-3 text-3xl font-semibold">{summary.attendance}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">Loading your teacher history…</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">No history available yet. Start by creating content or logging attendance.</div>
      ) : (
        <div className="space-y-4">
          {items.map((entry) => {
            const Icon = entry.source === 'Study Note' ? BookOpen : entry.source === 'Past Paper' ? FileText : entry.source === 'Tutorial' ? PlayCircle : entry.source === 'Quiz' ? HelpCircle : CalendarCheck;
            return (
              <div key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                      <p className="text-sm text-slate-500">{entry.source}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{entry.date}</div>
                </div>
                {entry.details ? <p className="mt-4 text-sm text-slate-600">{entry.details}</p> : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
