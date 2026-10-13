import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ContactInfoSection from "../Sections/ContactInfosection";
import CoursesSection from "../Sections/Coursessection";
import { FeaturesSection } from "../Sections/Featuressection";
import Footer from "../Sections/Footer";
import HeroSection from "../Sections/Herosection";
import Header from "../Sections/HomeHeader";
import MissionVisionSection from "../Sections/MissionVisionSection";
import NewsletterSection from "../Sections/NewsletterSection";
import NonprofitVerificationSection from "../Sections/NonprofitVerificationSection";
import "../styles/home.css";

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;

    // let the sections mount before measuring their offsets
    const frame = requestAnimationFrame(() => {
      document.getElementById(scrollTo)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.state]);

  return (
    <div className="slint-home">
      <a href="#main-content" className="home-skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <HeroSection />
        <div className="home-proof-strip">
          <div className="home-container proof-strip-inner">
            <p>
              A little direction.
              <br />
              <strong>A whole lot of possibility.</strong>
            </p>
            <span>
              <strong>12</strong> career paths to explore
            </span>
            <span>
              <strong>1:1</strong> mentorship that matters
            </span>
            <span>
              <strong>Hands-on</strong> learning, from day one
            </span>
          </div>
        </div>
        <CoursesSection />
        <FeaturesSection />
        <MissionVisionSection />
        <NonprofitVerificationSection />
        <ContactInfoSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
