import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const onSignup = location.pathname === '/signup';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (!isHome) {
      navigate('/', { state: { scrollTo: targetId } });
      return;
    }

    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navLinkClass =
    "text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer";

  return (
    <header className="sticky top-0 z-50 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-14 items-center justify-between rounded-full bg-white/90 pr-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 sm:pr-3 sm:pl-6 dark:bg-gray-900/90 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:ring-white/10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0 shrink-0">
            <img src="/assets/logo.svg" alt="" className="h-8 w-8" />
            <span className="hidden text-xl text-[#008080] sm:inline">
              <span className="font-bold">SLINT</span><span className="ml-[1.5px]">Tech</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')} className={navLinkClass}>Home</a>
            <a href="#explore" onClick={(e) => handleSmoothScroll(e, 'explore')} className={navLinkClass}>Explore</a>
            <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className={navLinkClass}>Mentorship</a>
            <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className={navLinkClass}>Contact</a>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="cursor-pointer rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to={onSignup ? '/login' : '/signup'}
              className="rounded-full bg-[linear-gradient(90deg,#333333_0%,#1E1E1E_100%)] px-5 py-2.5 font-semibold text-white transition hover:opacity-90 dark:bg-[linear-gradient(90deg,#008080_0%,#00a3a3_100%)]"
            >
              {onSignup ? 'Log in' : 'Join Us'}
            </Link>
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="cursor-pointer rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              className="cursor-pointer rounded-full p-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6 text-gray-700 dark:text-gray-300" /> : <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mt-2 rounded-3xl bg-white/95 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl md:hidden dark:bg-gray-900/95 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:ring-white/10">
            <div className="flex flex-col space-y-4">
              <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')} className={navLinkClass}>Home</a>
              <a href="#explore" onClick={(e) => handleSmoothScroll(e, 'explore')} className={navLinkClass}>Explore</a>
              <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className={navLinkClass}>Mentorship</a>
              <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className={navLinkClass}>Contact</a>
              <div className="flex flex-col space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                <Link to="/login" className={`${navLinkClass} text-left`} onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link
                  to={onSignup ? '/login' : '/signup'}
                  className="flex cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(90deg,#333333_0%,#1E1E1E_100%)] px-4 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-[linear-gradient(90deg,#008080_0%,#00a3a3_100%)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
