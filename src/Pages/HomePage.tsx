import ContactInfoSection from '../Sections/contactinfosection';
import CoursesSection from '../Sections/Coursessection';
import { FeaturesSection } from '../Sections/Featuressection';
import Footer from '../Sections/Footer';
import GetStartedSection from '../Sections/Getstartedsection';
import Header from '../Sections/Header';
import HeroSection from '../Sections/Herosection';
import MissionVisionSection from '../Sections/MissionVisionSection';
import NewsletterSection from '../Sections/NewsletterSection';

const HomePage = () => {
  return (
    <div className="bg-white dark:bg-gray-950 transition-colors">
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

      {/* Get Started Section */}
      <GetStartedSection />

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