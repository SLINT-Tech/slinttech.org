import {
  ArrowUpRight,
  BookOpen,
  Code2,
  HeartHandshake,
  MessageCircle,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: BookOpen,
    title: "Learn with a clear direction.",
    copy: "Follow a focused career path. Build your understanding one practical skill at a time.",
  },
  {
    icon: Code2,
    title: "Make something you’re proud of.",
    copy: "Put what you learn into practice. Build projects that show what you can do.",
  },
  {
    icon: Users,
    title: "Find your kind of people.",
    copy: "Share the small wins, work through the hard parts, and grow alongside people who get it.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="home-section features-section">
      <div className="home-container">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">THE SLINTTECH DIFFERENCE</span>
            <h2>
              Big dreams need
              <br />a good <em>support system.</em>
            </h2>
          </div>
          <p>
            Learning something new takes courage. We make sure you have the
            guidance and community to keep going.
          </p>
        </div>
        <div className="support-grid">
          <div className="mentor-feature">
            <span className="feature-icon">
              <HeartHandshake size={26} />
            </span>
            <h3>
              Your ambition.
              <br />
              Someone in your corner.
            </h3>
            <p>
              Connect with a mentor in your field. Ask the questions, get honest
              feedback, and take your next step with more confidence.
            </p>
            <Link className="home-text-link" to="/signup">
              Meet your next chapter <ArrowUpRight size={18} />
            </Link>
            <div className="mentor-illustration" aria-hidden="true">
              <div className="mentor-bubble">
                <MessageCircle size={18} /> Let’s work through it, together.
              </div>
              <img
                src="/assets/first.png"
                alt=""
                loading="lazy"
                width="400"
                height="240"
              />
            </div>
            <span className="mentor-footnote">
              HUMAN CONNECTION. REAL PROGRESS.
            </span>
          </div>
          <div className="support-list">
            {features.map(({ icon: Icon, title, copy }, i) => (
              <article key={title}>
                <span className="feature-icon">
                  <Icon size={23} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <span className="feature-index" aria-hidden="true">
                  {["↗", "+", "✳"][i]}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
