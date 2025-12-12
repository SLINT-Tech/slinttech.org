import { BookOpen, Home, Menu, Users, User, X, LayoutDashboard, Settings, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
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

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src="/assets/logo.svg" alt="SlintTech Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                SlintTech
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 font-medium transition-all duration-200 ${
                    isActive(link)
                      ? 'text-[#008080] dark:text-teal-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span className="text-sm">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userName}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {role !== 'Admin' && (
                    <>
                      <Link
                        to={role === 'Mentor' ? '/mentor/profile' : '/profile'}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium">View Profile</span>
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 border-l-4 ${
                  isActive(link)
                    ? 'border-[#008080] dark:border-teal-400 bg-[#008080]/5 dark:bg-teal-900/20 text-[#008080] dark:text-teal-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {link.icon}
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userName}</span>
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
