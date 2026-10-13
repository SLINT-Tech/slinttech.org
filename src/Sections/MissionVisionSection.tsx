import { ArrowUpRight, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function MissionVisionSection() {
  return (
    <section id="about" className="home-section mission-section">
      <div className="home-container mission-grid">
        <div className="mission-art" aria-hidden="true">
          <div className="mission-circle circle-a" />
          <div className="mission-circle circle-b" />
          <div className="mission-circle circle-c" />
          <Globe2 className="mission-globe" strokeWidth={0.7} />
          <span>
            Potential is everywhere.
            <br />
            <strong>Opportunity should be, too.</strong>
          </span>
          <span className="mission-art-label">
            ROOTED IN COMMUNITY. REACHING BEYOND BORDERS.
          </span>
        </div>
        <div className="mission-copy">
          <span className="home-eyebrow">MORE THAN A LEARNING PLATFORM</span>
          <h2>
            A better future.
            <br />
            <em>Built together.</em>
          </h2>
          <p>
            We believe the next generation of tech leaders should be defined by
            their ambition, integrity, and ideas.
          </p>
          <p>
            Our mission is to bring young people together through hands-on
            education, mentorship, and leadership. Because learning a skill is
            just the beginning. Using it to lift others up is what comes next.
          </p>
          <Link to="/signup" className="home-text-link">
            Be part of the story <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
