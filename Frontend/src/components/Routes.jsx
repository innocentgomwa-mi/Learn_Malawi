<<<<<<< HEAD
=======
// components/Routes.jsx
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
import { Routes, Route } from "react-router-dom";
import LandingPage from "./Landing_page";
import CareerResources from "../pages/CareerResources";
import PastPapers from "../pages/PastPapers";
import Quizes from "../pages/Quizes";
import StudyNotes from "../pages/StudyNotes";
import Tutorials from "../pages/Tutorials";
import About from "../pages/Abouts";
<<<<<<< HEAD
=======
import Contact from "../pages/Contact";
import News from "../pages/News";
import NewsFullStory from "../pages/news-full-story";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminLayout from "./admin-componenents/AdminLayout";
import AdminDashboard from "./admin-componenents/AdminDashboard";
import AdminUsers from "./admin-componenents/AdminUsers";
import ProtectedRoute from "./ProtectedRoute";
import AdminStudyNotes from "./admin-componenents/AdminStudyNotes";
import AdminPastPapers from "./admin-componenents/AdminPastPapers";
import AdminQuizzes from "./admin-componenents/AdminQuizzes";
import AdminTutorials from "./admin-componenents/AdminTutorials";

import AdminNews from "./admin-componenents/AdminNews";

import AdminCareerResources from "./admin-componenents/AdminCareerResources";

import AdminMessages from "./admin-componenents/AdminMessages";
import QuizPage from "../pages/QuizPage";



>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a

const RoutesComponent = () => {
  return (
    <Routes>
<<<<<<< HEAD
=======
      {/* Public Routes */}
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
      <Route path="/" element={<LandingPage />} />
      <Route path="/study-notes" element={<StudyNotes />} />
      <Route path="/past-papers" element={<PastPapers />} />
      <Route path="/tutorials" element={<Tutorials />} />
      <Route path="/quizes" element={<Quizes />} />
<<<<<<< HEAD
      <Route path="/career-resources" element={<CareerResources />} />
      <Route path="/abouts" element={<About/>}/>   
=======
       <Route path="/quiz/:id" element={<QuizPage />} />
      <Route path="/news" element={<News />} />
      <Route path="/news/:id" element={<NewsFullStory />} />
      <Route path="/career-resources" element={<CareerResources />} />
      <Route path="/abouts" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Admin Routes - Protected with authentication and role check */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRoles={['admin', 'teacher']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Routes */}
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* User Management Routes */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/new" element={<AdminUsers />} />
        <Route path="admins" element={<AdminUsers />} />
        <Route path="teachers" element={<AdminUsers />} />
        
        {/* Content Management Routes */}
        
        <Route path="study-notes" element={<AdminStudyNotes />} />
        <Route path="past-papers" element={<AdminPastPapers />} />
        
          <Route path="quizzes" element={<AdminQuizzes />} />
          
             <Route path="tutorials" element={<AdminTutorials />} />
             
             
             
              <Route path="news" element={<AdminNews />} />
              
              
        <Route path="career-resources" element={<AdminCareerResources />} />
        
        <Route path="messages" element={<AdminMessages />} />

        
        {/* Analytics & Settings Routes (to be implemented) */}
        {/* 
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        */}
      </Route>

      {/* Optional: Admin-specific login route */}
      <Route path="/admin/login" element={<Login />} />
      
      {/* Optional: Redirect for unauthorized access */}
      <Route path="/unauthorized" element={
        <div className="unauthorized-page">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <a href="/">Return to Home</a>
        </div>
      } />
      
      {/* 404 Page - Keep at the end */}
      <Route path="*" element={
        <div className="not-found-page">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/">Return to Home</a>
        </div>
      } />
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
    </Routes>
  );
};

<<<<<<< HEAD
export default RoutesComponent;
=======
export default RoutesComponent;
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
