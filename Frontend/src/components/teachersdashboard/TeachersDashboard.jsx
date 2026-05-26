// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useRefreshRate } from '@/lib/RefreshRateContext';
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes, fetchLearningPaths } from '@/api';
import { filterByTeacher } from './teacherUtils';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeachersTopBar from '@/components/teacher/TeachersTopBar';

export default function TeachersDashboard() {
  const { user } = useAuth();
  const { refreshSeconds } = useRefreshRate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ notes: 0, papers: 0, tutorials: 0, quizzes: 0, learningPaths: 0 });
  const [statuses, setStatuses] = useState({ pending: 0, published: 0, rejected: 0 });

  const loadCounts = useCallback(async ({ background } = { background: false }) => {
    if (!background) {
      setLoading(true);
    }

    const email = user?.email || '';

    try {
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

      const learningPaths = await fetchLearningPaths({ teacherEmail: email });
      const supportedLearningPaths = Array.isArray(learningPaths) ? learningPaths : learningPaths?.data ?? [];

      setCounts({
        notes: filteredNotes.length,
        papers: filteredPapers.length,
        tutorials: filteredTutorials.length,
        quizzes: filteredQuizzes.length,
        learningPaths: supportedLearningPaths.length,
      });

      const all = [...filteredNotes, ...filteredPapers, ...filteredTutorials, ...filteredQuizzes];
      setStatuses({
        pending: 0,
        published: all.length,
        rejected: 0,
      });
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadCounts();
  }, [user, loadCounts]);

  useEffect(() => {
    if (!refreshSeconds || !user) {
      return;
    }

    const intervalId = setInterval(() => {
      loadCounts({ background: true });
    }, refreshSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [refreshSeconds, user, loadCounts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeachersTopBar />
        <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
          <Outlet context={{ counts, statuses }} />
        </main>
      </div>
    </div>
  );
}
