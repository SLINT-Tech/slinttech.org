import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContactInfoSection from './Sections/contactinfosection';
import CoursesSection from './Sections/Coursessection';
import { FeaturesSection } from './Sections/Featuressection';
import Footer from './Sections/Footer';
import GetStartedSection from './Sections/Getstartedsection';
import Header from './Sections/Header';
import HeroSection from './Sections/Herosection';
import NewsletterSection from './Sections/NewsletterSection';
import SponsorsSection from './Sections/Sponsorssection';
import SignUpPage from './Pages/SignUpPage';
import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';
import MenteeDashboard from './Pages/MenteeDashboard';
import AdminLoginPage from './Pages/AdminLoginPage';
import AdminDashboard from './Pages/AdminDashboard';
import MentorsPage from './Pages/MentorsPage';
import LessonsPage from './Pages/LessonsPage';
import TasksPage from './Pages/TasksPage';
import TaskDetailPage from './Pages/TaskDetailPage';
import MentorDetailPage from './Pages/MentorDetailPage';
import MentorDashboard from './Pages/MentorDashboard';
import MentorLoginPage from './Pages/MentorLoginPage';
import MentorMenteesPage from './Pages/MentorMenteesPage';
import MentorSubmissionsPage from './Pages/MentorSubmissionsPage';
import MentorCourseDetailPage from './Pages/MentorCourseDetailPage';
import MentorCoursesPage from './Pages/MentorCoursesPage';
import MentorMenteeDetailPage from './Pages/MentorMenteeDetailPage';
import MenteeProfilePage from './Pages/MenteeProfilePage';
import PendingApprovalPage from './Pages/PendingApprovalPage';
import PaymentWallPage from './Pages/PaymentWallPage';
import MentorProfilePage from './Pages/MentorProfilePage';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-bricolage bg-[#F8F8F8]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mentor/login" element={<MentorLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route path="/pending-approval" element={
            <ProtectedRoute requireApproval={false} requirePayment={false}>
              <PendingApprovalPage />
            </ProtectedRoute>
          } />

          <Route path="/payment-wall" element={
            <ProtectedRoute requirePayment={false}>
              <PaymentWallPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="Mentee">
              <MenteeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute requiredRole="Mentee">
              <MenteeProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/mentors" element={
            <ProtectedRoute requiredRole="Mentee">
              <MentorsPage />
            </ProtectedRoute>
          } />

          <Route path="/lessons" element={
            <ProtectedRoute requiredRole="Mentee">
              <LessonsPage />
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute requiredRole="Mentee">
              <TasksPage />
            </ProtectedRoute>
          } />

          <Route path="/task/:taskId" element={
            <ProtectedRoute requiredRole="Mentee">
              <TaskDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/mentor/:mentorId" element={
            <ProtectedRoute requiredRole="Mentee">
              <MentorDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="Admin" requirePayment={false}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/mentor/dashboard" element={
            <ProtectedRoute requiredRole="Mentor">
              <MentorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/mentor/mentees" element={
            <ProtectedRoute requiredRole="Mentor">
              <MentorMenteesPage />
            </ProtectedRoute>
          } />

          <Route path="/mentor/mentee/:menteeId" element={
            <ProtectedRoute requiredRole="Mentor">
              <MentorMenteeDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/mentor/submissions" element={
            <ProtectedRoute requiredRole="Mentor">
              <MentorSubmissionsPage />
            </ProtectedRoute>
          } />

          <Route path="/mentor/course/:courseId" element={
            <ProtectedRoute requiredRole="Mentor">
              <MentorCourseDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/mentor/courses" element={
            <ProtectedRoute requiredRole="Mentor">
              <MentorCoursesPage />
            </ProtectedRoute>
          } />

          <Route path="/mentor/profile" element={
            <ProtectedRoute requiredRole="Mentor">
              <MentorProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;