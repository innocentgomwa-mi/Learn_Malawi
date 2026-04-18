// @ts-nocheck
<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> 4174fba (changes to admin dashboard)
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes } from '@/api';
import { filterByTeacher, hasTeacherField } from './teacherUtils';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';

export default function TeachersDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ notes: 0, papers: 0, tutorials: 0, quizzes: 0 });
  const [statuses, setStatuses] = useState({ pending: 0, approved: 0, rejected: 0 });

<<<<<<< HEAD
  const loadCounts = useCallback(async () => {
    setLoading(true);
    const email = user?.email || '';
    const [notes, papers, tutorials, quizzes] = await Promise.all([
      fetchStudyNotes(),
      fetchPastPapers(),
      fetchTutorials(),
      fetchQuizzes(),
    ]);

    const supportedNotes = Array.isArray(notes) ? notes : [];
    const supportedPapers = Array.isArray(papers) ? papers : [];
    const supportedTutorials = Array.isArray(tutorials) ? tutorials : [];
    const supportedQuizzes = Array.isArray(quizzes) ? quizzes : [];

    const filteredNotes = filterByTeacher(supportedNotes, email);
    const filteredPapers = filterByTeacher(supportedPapers, email);
    const filteredTutorials = filterByTeacher(supportedTutorials, email);
    const filteredQuizzes = filterByTeacher(supportedQuizzes, email);

    setCounts({
      notes: filteredNotes.length || (!supportedNotes.some(hasTeacherField) ? supportedNotes.length : filteredNotes.length),
      papers: filteredPapers.length || (!supportedPapers.some(hasTeacherField) ? supportedPapers.length : filteredPapers.length),
      tutorials: filteredTutorials.length || (!supportedTutorials.some(hasTeacherField) ? supportedTutorials.length : filteredTutorials.length),
      quizzes: filteredQuizzes.length || (!supportedQuizzes.some(hasTeacherField) ? supportedQuizzes.length : filteredQuizzes.length),
    });

    const all = [...filteredNotes, ...filteredPapers, ...filteredTutorials, ...filteredQuizzes];
    setStatuses({
      pending: all.filter((r) => r?.status === 'pending').length,
      approved: all.filter((r) => r?.status === 'approved').length,
      rejected: all.filter((r) => r?.status === 'rejected').length,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);
=======
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const email = user?.email || '';
      const [notes, papers, tutorials, quizzes] = await Promise.all([
        fetchStudyNotes({ teacherEmail: email }),
        fetchPastPapers({ teacherEmail: email }),
        fetchTutorials({ teacherEmail: email }),
        fetchQuizzes({ teacherEmail: email }),
      ]);

      const supportedNotes = Array.isArray(notes) ? notes : [];
      const supportedPapers = Array.isArray(papers) ? papers : [];
      const supportedTutorials = Array.isArray(tutorials) ? tutorials : [];
      const supportedQuizzes = Array.isArray(quizzes) ? quizzes : [];

      const filteredNotes = filterByTeacher(supportedNotes, email);
      const filteredPapers = filterByTeacher(supportedPapers, email);
      const filteredTutorials = filterByTeacher(supportedTutorials, email);
      const filteredQuizzes = filterByTeacher(supportedQuizzes, email);

      setCounts({
        notes: filteredNotes.length,
        papers: filteredPapers.length,
        tutorials: filteredTutorials.length,
        quizzes: filteredQuizzes.length,
      });

      const all = [...filteredNotes, ...filteredPapers, ...filteredTutorials, ...filteredQuizzes];
      setStatuses({
        pending: all.filter((r) => r?.status === 'pending').length,
        approved: all.filter((r) => r?.status === 'approved').length,
        rejected: all.filter((r) => r?.status === 'rejected').length,
      });
      setLoading(false);
    };

    load();
  }, [user]);
>>>>>>> 4174fba (changes to admin dashboard)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar />
      <main className="flex-1 p-8 animate-fade-in">
        <div className="space-y-6">
<<<<<<< HEAD
          <Outlet context={{ counts, statuses, refreshDashboard: loadCounts }} />
=======
          <Outlet context={{ counts, statuses }} />
>>>>>>> 4174fba (changes to admin dashboard)
        </div>
      </main>
    </div>
  );
}
