import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/slinttech", icon: Facebook },
  { label: "Twitter", href: "https://www.twitter.com/slinttech", icon: Twitter },
  { label: "Instagram", href: "https://www.instagram.com/slinttech/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/slinttech", icon: Linkedin },
];

const Footer: React.FC = () => {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const linkClass =
    "text-sm text-gray-400 transition-colors hover:text-teal-400 cursor-pointer";

  const headingClass =
    "text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase";

  return (
    <footer className="bg-gray-950 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-6 md:col-span-2">
            <img
              src="/assets/Slintech_logo.svg"
              alt="SlintTech"
              className="h-11"
            />

            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              Empowering the next generation of tech leaders through quality
              education, mentorship, and community. Join us in building a future
              where technology uplifts and serves communities.
            </p>

            <div className="flex gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-gray-400 transition hover:bg-[#008080] hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={headingClass}>Quick links</h3>
            <ul className="mt-6 space-y-3">
              <li>
                <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')} className={linkClass}>
                  Home
                </a>
              </li>
              <li>
                <a href="#explore" onClick={(e) => handleSmoothScroll(e, 'explore')} className={linkClass}>
                  Career paths
                </a>
              </li>
              <li>
                <a href="#certifications" onClick={(e) => handleSmoothScroll(e, 'certifications')} className={linkClass}>
                  Memberships
                </a>
              </li>
              <li>
                <Link to="/signup" className={linkClass}>
                  Join community
                </Link>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className={linkClass}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Get in touch</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#008080]" />
                <a href="mailto:contact@slinttech.org" className={linkClass}>
                  contact@slinttech.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#008080]" />
                <span className="text-sm text-gray-400">
                  Building future leaders
                  <br />
                  across the globe
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-gray-300">SlintTech</span>. All
            rights reserved.
          </p>
          <Link
            to="/login"
            className="text-sm text-gray-400 transition-colors hover:text-teal-400"
          >
            Member login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
