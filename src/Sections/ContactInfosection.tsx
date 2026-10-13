import { ArrowUpRight, Mail } from "lucide-react";
export default function ContactInfoSection() {
  return (
    <section id="contact" className="home-section contact-section">
      <div className="home-container contact-inner">
        <div>
          <span className="home-eyebrow">A CONVERSATION CAN CHANGE THINGS</span>
          <h2>
            Questions? <em>Let’s talk.</em>
          </h2>
          <p>
            About your next step, mentorship, or getting involved.
            <br />
            There’s a real person on the other side.
          </p>
        </div>
        <a className="contact-email" href="mailto:contact@slinttech.org">
          <span className="contact-mail-icon">
            <Mail size={26} />
          </span>
          <span>
            <small>DROP US A NOTE</small>
            <strong>contact@slinttech.org</strong>
          </span>
          <ArrowUpRight size={24} />
        </a>
      </div>
    </section>
  );
}
