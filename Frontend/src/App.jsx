import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AccessibilityProvider } from '@/lib/AccessibilityContext';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { RefreshRateProvider } from '@/lib/RefreshRateContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import MaintenancePage from './components/MaintenancePage';
import { usePageLogger } from '@/hooks/usePageLogger';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import StudyNotes from './pages/StudyNotes';
import PastPapers from './pages/PastPapers';
import Tutorials from './pages/Tutorials';
import SearchResults from './pages/SearchResults';
import Quizzes from './pages/Quizzes';
import Career from './pages/Career';
import StudyGroups from './pages/StudyGroups';
import Discussions from './pages/Discussions';
import Abouts from './pages/Abouts';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Unauthorized from './pages/Unauthorized';
import TeachersDashboard from './components/teachersdashboard/TeachersDashboard';
import TeachersDashboardOverview from './components/teachersdashboard/TeachersDashboardOverview';
import PastPapersAdmin from './components/teachersdashboard/PastPapersAdmin';
import StudyNotesAdmin from './components/teachersdashboard/StudyNotesAdmin';
import TutorialsAdmin from './components/teachersdashboard/TutorialsAdmin';
import QuizzesAdmin from './components/teachersdashboard/QuizzesAdmin';
import CareerResourcesAdmin from './components/teachersdashboard/CareerResourcesAdmin';
import TeachersStudents from './components/teachersdashboard/TeachersStudents';
import TeachersAttendance from './components/teachersdashboard/TeachersAttendance';
import TeachersAnalytics from './components/teachersdashboard/TeachersAnalytics';
import TeachersDiscussions from './components/teachersdashboard/TeachersDiscussions';
import TeacherAnnouncements from './components/teachersdashboard/TeacherAnnouncements';
import TeacherSettings from './components/teachersdashboard/TeacherSettings';
import StudyGroupsAdmin from './components/teacher/StudyGroupsAdmin';
import LearningPathsAdmin from './components/teacher/LearningPathsAdmin';
import LearningPaths from './pages/LearningPaths';
import LearningHistory from './pages/LearningHistory';
import TeacherSchedule from './pages/TeacherSchedule';
import TeacherCollaboration from './pages/TeacherCollaboration';
import Insight from './pages/Insight';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import MySchedule from './pages/MySchedule';
import ProtectedRoute from './components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, error, navigateToLogin, isAuthenticated, appPublicSettings } = useAuth();

  usePageLogger('page_viewed');

  const maintenanceSetting = appPublicSettings?.find((setting) => setting.key === 'maintenance_mode');
  const maintenanceMessageSetting = appPublicSettings?.find((setting) => setting.key === 'maintenance_message');
  const isMaintenanceMode = maintenanceSetting?.value === 'true';
  const maintenanceMessage = maintenanceMessageSetting?.value || "We'll be back shortly.";

  if (isMaintenanceMode) {
    return <MaintenancePage message={maintenanceMessage} />;
  }

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (error) {
    if (typeof error === 'object' && error?.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }

    navigateToLogin();
    return null;
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={isAuthenticated ? <LandingPage /> : <Home />} />
        <Route path="/study-notes" element={<StudyNotes />} />
        <Route path="/past-papers" element={<PastPapers />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/study-groups" element={<StudyGroups />} />
        <Route path="/discussions" element={<ProtectedRoute requiredRoles={[]}><Discussions /></ProtectedRoute>} />
        <Route path="/abouts" element={<Abouts />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/career" element={<Career />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<ProtectedRoute requiredRoles={[]}><Settings /></ProtectedRoute>} />
        <Route path="/my-schedule" element={<ProtectedRoute requiredRoles={[]}><MySchedule /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute requiredRoles={[]}><Achievements /></ProtectedRoute>} />
        <Route path="/learning-paths" element={<LearningPaths />} />
        <Route path="/learning-history" element={<LearningHistory />} />
        <Route path="/teacher" element={<ProtectedRoute><TeachersDashboard /></ProtectedRoute>}>
          <Route index element={<TeachersDashboardOverview />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="collaboration" element={<TeacherCollaboration />} />
          <Route path="study-notes" element={<StudyNotesAdmin />} />
          <Route path="past-papers" element={<PastPapersAdmin />} />
          <Route path="tutorials" element={<TutorialsAdmin />} />
          <Route path="career-resources" element={<CareerResourcesAdmin />} />
          <Route path="study-groups" element={<StudyGroupsAdmin />} />
          <Route path="learning-paths" element={<LearningPathsAdmin />} />
          <Route path="quizzes" element={<QuizzesAdmin />} />
          <Route path="students" element={<TeachersStudents />} />
          <Route path="attendance" element={<TeachersAttendance />} />
          <Route path="insights" element={<Insight />} />
          <Route path="analytics" element={<TeachersAnalytics />} />
          <Route path="discussions" element={<TeachersDiscussions />} />
          <Route path="announcements" element={<TeacherAnnouncements />} />
          <Route path="settings" element={<TeacherSettings />} />
        </Route>
        <Route path="/teachersdashboard" element={<Navigate to="/teacher" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <AccessibilityProvider>
        <RefreshRateProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </RefreshRateProvider>
      </AccessibilityProvider>
    </AuthProvider>
  )
}

export default App