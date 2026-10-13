import { CheckCircle2 } from "lucide-react";
const memberships = [
  "Google for Nonprofits",
  "Microsoft Nonprofits",
  "Slack for Nonprofits",
  "TechSoup",
];
export default function NonprofitVerificationSection() {
  return (
    <section id="certifications" className="memberships-section">
      <div className="home-container">
        <div className="membership-intro">
          <span className="home-eyebrow">TOOLS THAT SUPPORT OUR MISSION</span>
          <p>Members of nonprofit programs helping us do more.</p>
        </div>
        <ul className="membership-list">
          {memberships.map((name) => (
            <li key={name}>
              <CheckCircle2 size={19} />
              <span>{name}</span>
            </li>
          ))}
        </ul>
        <p className="membership-note">
          Program memberships provide access to technology and resources for our
          nonprofit work.
        </p>
      </div>
    </section>
  );
}
