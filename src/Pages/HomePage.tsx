import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ContactInfoSection from '../Sections/ContactInfosection';
import CoursesSection from '../Sections/Coursessection';
import { FeaturesSection } from '../Sections/Featuressection';
import Footer from '../Sections/Footer';
import GetStartedSection from '../Sections/Getstartedsection';
import Header from '../Sections/Header';
import HeroSection from '../Sections/Herosection';
import MissionVisionSection from '../Sections/MissionVisionSection';
import NewsletterSection from '../Sections/NewsletterSection';
import NonprofitVerificationSection from '../Sections/NonprofitVerificationSection';

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;

    // let the sections mount before measuring their offsets
    const frame = requestAnimationFrame(() => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.state]);

  return (
    <div className="bg-[#f8f8f8] dark:bg-gray-950 transition-colors">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Mission & Vision Section */}
      <MissionVisionSection />

      {/* Courses Section */}
      <CoursesSection />

      {/* Nonprofit Verification Section */}
      <NonprofitVerificationSection />

      {/* Get Started Section */}
      {/* <GetStartedSection /> */}

      {/* Contact Section */}
      <ContactInfoSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;