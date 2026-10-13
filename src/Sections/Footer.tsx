import { Facebook, Globe2, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/slinttech",
    icon: Facebook,
  },
  {
    label: "Twitter",
    href: "https://www.twitter.com/slinttech",
    icon: Twitter,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/slinttech/",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/slinttech",
    icon: Linkedin,
  },
];
export default function Footer() {
  return (
    <footer className="home-footer">
      <div className="home-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="home-logo" aria-label="SlintTech home">
              <img src="/assets/logo.svg" alt="" width="36" height="36" />
              <span>
                SLINT<span>Tech</span>
              </span>
            </Link>
            <p>
              Skills to build with. People to grow with.
              <br />A future worth showing up for.
            </p>
            <div className="footer-socials">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          <div className="footer-column">
            <h3>FIND YOUR WAY</h3>
            <ul>
              <li>
                <a href="#explore">Explore career paths</a>
              </li>
              <li>
                <a href="#features">Mentorship & community</a>
              </li>
              <li>
                <a href="#about">Our story</a>
              </li>
              <li>
                <a href="#certifications">Nonprofit memberships</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>LET’S CONNECT</h3>
            <ul>
              <li>
                <a href="mailto:contact@slinttech.org">contact@slinttech.org</a>
              </li>
              <li>
                <Link to="/signup">Join the community</Link>
              </li>
              <li>
                <Link to="/login">Member login</Link>
              </li>
            </ul>
            <p>
              Building future leaders,
              <br />
              across the globe.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SlintTech. All rights reserved.</p>
          <span>
            <Globe2 size={13} /> BIG DREAMS HAVE NO BORDERS.
          </span>
        </div>
      </div>
    </footer>
  );
}
