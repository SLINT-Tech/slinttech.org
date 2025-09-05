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

function App() {
  return (
    <Router>
      <div className="min-h-screen font-bricolage bg-[#F8F8F8]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<MenteeDashboard />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;