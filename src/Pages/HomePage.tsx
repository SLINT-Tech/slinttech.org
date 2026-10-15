import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../lib/scrollToSection';
import ContactInfoSection from '../Sections/ContactInfosection';
import CoursesSection from '../Sections/Coursessection';
import { FeaturesSection } from '../Sections/Featuressection';
import Footer from '../Sections/Footer';
import GetStartedSection from '../Sections/Getstartedsection';
import Header from '../Sections/Header';
import HeroSection from '../Sections/Herosection';
import LearningPartnersSection from '../Sections/LearningPartnersSection';
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
      scrollToSection(scrollTo);
    });
    return () => cancelAnimationFrame(frame);
  }, [location.state]);

  return (
    <div className="bg-[#f8f8f8] dark:bg-gray-950 transition-colors">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-[#008080] focus:px-5 focus:py-2.5 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {/* Header */}
      <Header />

      {/* tabIndex lets the skip link move focus here, not only the scroll position */}
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Mission & Vision Section */}
        <MissionVisionSection />

        {/* Courses Section */}
        <CoursesSection />

        {/* Learning Partners Section */}
        <LearningPartnersSection />

        {/* Nonprofit Verification Section */}
        <NonprofitVerificationSection />

        {/* Get Started Section */}
        {/* <GetStartedSection /> */}

        {/* Contact Section */}
        <ContactInfoSection />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;