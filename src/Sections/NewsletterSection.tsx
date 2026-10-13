import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
export default function NewsletterSection() {
  return (
    <section id="community" className="community-section">
      <div className="home-container community-inner">
        <div className="community-orbit" aria-hidden="true" />
        <span className="home-eyebrow">THIS IS YOUR STARTING POINT</span>
        <h2>
          You don’t have to see the whole staircase.
          <br />
          <span>Just take the first step.</span>
        </h2>
        <p>A new skill. A new connection. A new possibility. It starts here.</p>
        <Link to="/signup" className="home-button home-button-white">
          Let’s build your future <ArrowUpRight size={19} />
        </Link>
        <span className="community-caption">YOUR AMBITION BELONGS HERE.</span>
      </div>
    </section>
  );
}
