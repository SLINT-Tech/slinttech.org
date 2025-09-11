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

function App() {
  return (
    <Router>
      <div className="min-h-screen font-bricolage bg-[#F8F8F8]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<MenteeDashboard />} />
          <Route path="/profile" element={<MenteeProfilePage />} />
          <Route path="/mentors" element={<MentorsPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/task/:taskId" element={<TaskDetailPage />} />
          <Route path="/mentor/:mentorId" element={<MentorDetailPage />} />
          <Route path="/mentor/login" element={<MentorLoginPage />} />
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/mentees" element={<MentorMenteesPage />} />
          <Route path="/mentor/mentee/:menteeId" element={<MentorMenteeDetailPage />} />
          <Route path="/mentor/submissions" element={<MentorSubmissionsPage />} />
          <Route path="/mentor/course/:courseId" element={<MentorCourseDetailPage />} />
          <Route path="/mentor/courses" element={<MentorCoursesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;