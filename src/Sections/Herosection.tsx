import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Globe2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section id="home" className="home-hero">
      <div className="home-container hero-grid">
        <div className="hero-copy">
          <span className="home-eyebrow">
            <span className="eyebrow-dot" /> BIG AMBITIONS. REAL POSSIBILITIES.
          </span>
          <h1>
            Your next chapter
            <br />
            starts with{" "}
            <span className="hero-you">
              you.
              <svg viewBox="0 0 200 16" aria-hidden="true">
                <path d="M4 11 Q90 -2 195 7 M20 15 Q95 5 176 12" />
              </svg>
            </span>
          </h1>
          <p>
            You bring the ambition. We bring the skills, the mentors, and a
            community that’s in your corner. Build a future in tech that feels
            like you.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="home-button">
              Start your journey <ArrowUpRight size={19} />
            </Link>
            <a href="#explore" className="home-text-link">
              Explore career paths <ArrowRight size={18} />
            </a>
          </div>
          <div className="hero-support">
            <span className="hero-support-icon">
              <Users size={20} />
            </span>
            <div>
              <strong>Go further, together.</strong>
              <span>A community built around your potential.</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-stage">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <span className="hero-stage-word" aria-hidden="true">
              BECOME.
            </span>
            <img
              className="hero-person"
              src="/assets/hero-tech-guy-trimmed.png"
              alt="Smiling learner in a SlintTech hoodie holding a laptop with a coding project"
              width="900"
              height="1424"
              fetchPriority="high"
            />
            <div className="hero-stage-caption">
              <span>
                <span className="caption-dot" /> YOUR POTENTIAL, IN PROGRESS
              </span>
              <ArrowUpRight size={21} />
            </div>
          </div>
          <div className="hero-note note-code" aria-hidden="true">
            <span className="note-icon">
              <Code2 size={21} />
            </span>
            <div>
              <strong>Less just watching.</strong>
              <span>More “I built that.”</span>
            </div>
          </div>
          <div className="hero-note note-mentor">
            <span className="mentor-check">
              <Check size={17} />
            </span>
            <div>
              <strong>A mentor in your corner</strong>
              <span>Real guidance. Every step.</span>
            </div>
          </div>
          <span className="hero-side-label" aria-hidden="true">
            LEARN. BUILD. BECOME.
          </span>
        </div>
      </div>
      <div className="home-container hero-bottom">
        <a href="#explore" className="hero-scroll">
          <ArrowDown size={16} /> YOUR FUTURE IS WORTH EXPLORING
        </a>
        <span>
          <Globe2 size={15} /> Built for ambition. Open to the world.
        </span>
      </div>
    </section>
  );
}
