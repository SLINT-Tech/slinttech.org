import { BookOpen, ChevronDown, Home, LayoutDashboard, LogOut, Menu, Moon, Sun, User, Users, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
  activePaths?: string[];
}

interface NavigationProps {
  role: 'Mentor' | 'Mentee' | 'Admin';
  userName: string;
  onLogout: () => void;
}

const Navigation = ({ role, userName, onLogout }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mentorLinks: NavLink[] = [
    {
      path: '/mentor/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      activePaths: ['/mentor/dashboard']
    },
    {
      path: '/mentor/courses',
      label: 'Courses',
      icon: <BookOpen className="w-4 h-4" />,
      activePaths: ['/mentor/courses', '/mentor/course']
    },
    {
      path: '/mentor/mentees',
      label: 'Mentees',
      icon: <Users className="w-4 h-4" />,
      activePaths: ['/mentor/mentees', '/mentor/mentee']
    }
  ];

  const menteeLinks: NavLink[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      activePaths: ['/dashboard']
    },
    {
      path: '/mentors',
      label: 'Mentors',
      icon: <Users className="w-4 h-4" />,
      activePaths: ['/mentors', '/mentor', '/mentor-detail', '/mentor-courses']
    },
    {
      path: '/courses',
      label: 'Courses',
      icon: <BookOpen className="w-4 h-4" />,
      activePaths: ['/courses', '/mentor-course-detail', '/course']
    }
  ];

  const adminLinks: NavLink[] = [];

  const links = role === 'Mentor' ? mentorLinks : role === 'Mentee' ? menteeLinks : adminLinks;

  const isActive = (link: NavLink) => {
    if (!link.activePaths) return location.pathname === link.path;

    return link.activePaths.some(path => {
      // For exact match
      if (location.pathname === path) return true;

      // For paths that should match with ID patterns (e.g., /mentor/:id)
      // Match /mentor/xyz but NOT /mentor-detail or /mentor-courses
      if (path === '/mentor' || path === '/mentors') {
        // Check if current path is /mentor/[id] (has a slash after mentor)
        if (location.pathname.match(/^\/mentor\/[^/]+$/)) return path === '/mentor';
        // Check if current path starts with /mentors
        if (location.pathname.startsWith('/mentors')) return path === '/mentors';
        return false;
      }

      // For other paths, use startsWith
      return location.pathname.startsWith(path);
    });
  };

  const iconButtonClass =
    "cursor-pointer rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";

  return (
    <header className="sticky top-0 z-50 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between rounded-full bg-white/90 pr-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 sm:pl-6 dark:bg-gray-900/90 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:ring-white/10">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex shrink-0 items-center">
              <img src="/assets/logo.svg" alt="" className="h-8 w-8" />
              <span className="hidden text-xl text-[#008080] sm:block">
                <span className="font-bold">SLINT</span><span className="ml-[1.5px]">Tech</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive(link) ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive(link)
                      ? 'bg-[#008080]/10 text-[#008080] dark:bg-teal-400/12 dark:text-teal-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={toggleDarkMode}
              className={iconButtonClass}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-900/[0.05] py-2 pr-3 pl-2 transition hover:bg-gray-900/10 dark:bg-white/[0.07] dark:hover:bg-white/12"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-400/15 dark:text-teal-400">
                  <User className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{userName.split(' ')[0]}</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 z-50 mt-3 w-52 rounded-2xl bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 dark:bg-gray-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:ring-white/10">
                  {role !== 'Admin' && (
                    <>
                      <Link
                        to={role === 'Mentor' ? '/mentor/profile' : '/profile'}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium">View profile</span>
                      </Link>
                      <div className="my-1 border-t border-gray-200 dark:border-gray-800" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium">Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={toggleDarkMode}
              className={iconButtonClass}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="cursor-pointer rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-2 rounded-3xl bg-white/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl md:hidden dark:bg-gray-900/95 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:ring-white/10">
            <nav className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive(link) ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive(link)
                      ? 'bg-[#008080]/10 text-[#008080] dark:bg-teal-400/12 dark:text-teal-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-3 flex items-center justify-between border-t border-gray-200 px-4 pt-4 dark:border-gray-800">
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-400/15 dark:text-teal-400">
                  <User className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{userName.split(' ')[0]}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="cursor-pointer text-sm font-semibold text-gray-600 transition-colors hover:text-[#008080] dark:text-gray-400 dark:hover:text-teal-400"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
