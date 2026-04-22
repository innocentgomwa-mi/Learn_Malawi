import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Home from './pages/Home';
import StudyNotes from './pages/StudyNotes';
import PastPapers from './pages/PastPapers';
import Tutorials from './pages/Tutorials';
import Quizzes from './pages/Quizzes';
import Career from './pages/Career';
import Abouts from './pages/Abouts';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Unauthorized from './pages/Unauthorized';
import TeachersDashboard from './components/teachersdashboard/TeachersDashboard';
import TeachersDashboardOverview from './components/teachersdashboard/TeachersDashboardOverview';
import PastPapersAdmin from './components/teachersdashboard/PastPapersAdmin';
import StudyNotesAdmin from './components/teachersdashboard/StudyNotesAdmin';
import TutorialsAdmin from './components/teachersdashboard/TutorialsAdmin';
import QuizzesAdmin from './components/teachersdashboard/QuizzesAdmin';
import TeachersStudents from './components/teachersdashboard/TeachersStudents';
import TeachersAttendance from './components/teachersdashboard/TeachersAttendance';
import TeachersAnalytics from './components/teachersdashboard/TeachersAnalytics';
import TeachersDiscussions from './components/teachersdashboard/TeachersDiscussions';
import TeacherAnnouncements from './components/teachersdashboard/TeacherAnnouncements';
import TeacherSettings from './components/teachersdashboard/TeacherSettings';
import ProtectedRoute from './components/ProtectedRoute';
import CreateAccountPrompt from './components/CreateAccountPrompt';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/study-notes" element={isAuthenticated ? <StudyNotes /> : <CreateAccountPrompt />} />
        <Route path="/past-papers" element={isAuthenticated ? <PastPapers /> : <CreateAccountPrompt />} />
        <Route path="/tutorials" element={isAuthenticated ? <Tutorials /> : <CreateAccountPrompt />} />
        <Route path="/abouts" element={!isAuthenticated ? <Abouts /> : <Navigate to="/" replace />} />
        <Route path="/quizzes" element={isAuthenticated ? <Quizzes /> : <CreateAccountPrompt />} />
        <Route path="/career" element={isAuthenticated ? <Career /> : <CreateAccountPrompt />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teacher" element={<ProtectedRoute><TeachersDashboard /></ProtectedRoute>}>
          <Route index element={<TeachersDashboardOverview />} />
          <Route path="study-notes" element={<StudyNotesAdmin />} />
          <Route path="past-papers" element={<PastPapersAdmin />} />
          <Route path="tutorials" element={<TutorialsAdmin />} />
          <Route path="quizzes" element={<QuizzesAdmin />} />
          <Route path="students" element={<TeachersStudents />} />
          <Route path="attendance" element={<TeachersAttendance />} />
          <Route path="analytics" element={<TeachersAnalytics />} />
          <Route path="discussions" element={<TeachersDiscussions />} />
          <Route path="announcements" element={<TeacherAnnouncements />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>
        <Route path="/teachersdashboard" element={<Navigate to="/teacher" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App