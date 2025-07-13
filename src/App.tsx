import ContactInfoSection from './Sections/contactinfosection';
import CoursesSection from './Sections/Coursessection';
import { FeaturesSection } from './Sections/Featuressection';
import Footer from './Sections/Footer';
import GetStartedSection from './Sections/Getstartedsection';
import Header from './Sections/Header';
import HeroSection from './Sections/Herosection';
import NewsletterSection from './Sections/NewsletterSection';
import SponsorsSection from './Sections/Sponsorssection';

function App() {

  return (
    <div className="min-h-screen font-bricolage bg-[#F8F8F8]">
      {/* Header */}
      <Header />


      {/* Hero Section */}
      <HeroSection />


      {/* Features Section */}
      <FeaturesSection />


      {/* Sponsors */}
      {/* <SponsorsSection /> */}


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
}

export default App;