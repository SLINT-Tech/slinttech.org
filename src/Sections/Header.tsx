import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import { scrollToSection } from '../lib/scrollToSection';

interface HeaderProps {
  // Pages shown to a signed-in user (pending approval, payment) pass this to show Logout instead of Join Us / Log in.
  onLogout?: () => void;
}

const LOGIN_PATHS = ['/login', '/mentor/login', '/admin/login'];

export default function Header({ onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const onSignup = location.pathname === '/signup';
  const onLoginPage = LOGIN_PATHS.includes(location.pathname);
  // Offer the other half of the sign-in pair: Log in on the sign-up page, Join Us everywhere else.
  const actionTo = onSignup ? '/login' : '/signup';
  const actionLabel = onSignup ? 'Log in' : 'Join Us';
  const logoutClass =
    "cursor-pointer rounded-full px-5 py-2.5 font-semibold text-[#008080] transition-colors hover:bg-gray-100 dark:text-teal-400 dark:hover:bg-gray-800";

  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (!isHome) {
      navigate('/', { state: { scrollTo: targetId } });
      return;
    }

    // wait for the mobile menu to collapse so the scroll target is measured after the layout shift
    requestAnimationFrame(() => scrollToSection(targetId));
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
      {/* every page that renders this header has <main id="main" tabIndex={-1}> */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-[#008080] focus:px-5 focus:py-2.5 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-14 items-center justify-between rounded-full bg-white/90 pr-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 sm:pr-3 sm:pl-6 dark:bg-gray-900/90 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:ring-white/10">
          {/* Logo */}
          <Link to="/" aria-label="SLINT Tech home" className="flex items-center gap-0 shrink-0">
            <img src="/assets/logo.svg" alt="" className="h-8 w-8" />
            <span className="hidden text-xl text-[#008080] sm:inline">
              <span className="font-bold">SLINT</span><span className="ml-[1.5px]">Tech</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
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
            {onLogout ? (
              <button type="button" onClick={onLogout} className={logoutClass}>
                Logout
              </button>
            ) : (
              <Link
                to={actionTo}
                className="rounded-full bg-[#008080] px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#006666]"
              >
                {actionLabel}
              </Link>
            )}
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
              ref={menuButtonRef}
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
            <nav aria-label="Main" className="flex flex-col space-y-4">
              <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')} className={navLinkClass}>Home</a>
              <a href="#explore" onClick={(e) => handleSmoothScroll(e, 'explore')} className={navLinkClass}>Explore</a>
              <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className={navLinkClass}>Mentorship</a>
              <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className={navLinkClass}>Contact</a>
              <div className="flex flex-col space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                {onLogout ? (
                  <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center rounded-full bg-[#008080] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#006666]"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    {!onSignup && !onLoginPage && (
                      <Link to="/login" className={`${navLinkClass} text-left`} onClick={() => setIsMenuOpen(false)}>Login</Link>
                    )}
                    <Link
                      to={actionTo}
                      className="flex cursor-pointer items-center justify-center rounded-full bg-[#008080] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#006666]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {actionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
