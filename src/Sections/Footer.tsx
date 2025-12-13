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

const Footer: React.FC = () => {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="pt-16 pb-8 transition-colors duration-300 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/assets/Slintech_logo.svg"
                alt="SLINT Tech Logo"
                className="h-12"
              />
            </div>

            <p className="text-sm leading-relaxed max-w-md text-slate-400">
              Empowering the next generation of tech leaders through quality
              education, mentorship, and community. Join us in building a future
              where technology uplifts and serves communities.
            </p>

            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/slinttech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl transition-all duration-300 bg-slate-800 hover:bg-gradient-to-r hover:from-[#008080] hover:to-[#00a3a3] text-slate-400 hover:text-white shadow-sm hover:shadow-lg"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.twitter.com/slinttech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl transition-all duration-300 bg-slate-800 hover:bg-gradient-to-r hover:from-[#008080] hover:to-[#00a3a3] text-slate-400 hover:text-white shadow-sm hover:shadow-lg"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/slinttech/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl transition-all duration-300 bg-slate-800 hover:bg-gradient-to-r hover:from-[#008080] hover:to-[#00a3a3] text-slate-400 hover:text-white shadow-sm hover:shadow-lg"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/slinttech"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl transition-all duration-300 bg-slate-800 hover:bg-gradient-to-r hover:from-[#008080] hover:to-[#00a3a3] text-slate-400 hover:text-white shadow-sm hover:shadow-lg"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-[#008080] to-[#00a3a3] bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleSmoothScroll(e, 'home')}
                  className="text-sm transition-colors text-slate-400 hover:text-[#00a3a3] cursor-pointer"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleSmoothScroll(e, 'explore')}
                  className="text-sm transition-colors text-slate-400 hover:text-[#00a3a3] cursor-pointer"
                >
                  Career Paths
                </a>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-sm transition-colors text-slate-400 hover:text-[#00a3a3]"
                >
                  Join Community
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleSmoothScroll(e, 'contact')}
                  className="text-sm transition-colors text-slate-400 hover:text-[#00a3a3] cursor-pointer"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-[#008080] to-[#00a3a3] bg-clip-text text-transparent">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#00a3a3]" />
                <a
                  href="mailto:contact@slinttech.org"
                  className="text-sm transition-colors text-slate-400 hover:text-[#00a3a3]"
                >
                  contact@slinttech.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#00a3a3]" />
                <span className="text-sm text-slate-400">
                  Building Future Leaders
                  <br />
                  Across the Globe
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()}{" "}
              <span className="font-bold bg-gradient-to-r from-[#008080] to-[#00a3a3] bg-clip-text text-transparent">
                SLINT Tech
              </span>
              . All Rights Reserved.
            </p>

            {/* <div className="flex gap-6">
              <a
                href="#"
                className="text-sm transition-colors text-slate-600 hover:text-[#008080] dark:text-slate-400 dark:hover:text-[#00a3a3]"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm transition-colors text-slate-600 hover:text-[#008080] dark:text-slate-400 dark:hover:text-[#00a3a3]"
              >
                Terms of Service
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
