import { BookOpen, Home, Menu, Users, User, X, LayoutDashboard, Settings } from 'lucide-react';
import { useState } from 'react';
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
  const location = useLocation();

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
    },
    {
      path: '/mentor/profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      activePaths: ['/mentor/profile']
    }
  ];

  const menteeLinks: NavLink[] = [
    {
      path: '/mentee/dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      activePaths: ['/mentee/dashboard']
    },
    {
      path: '/mentee/mentors',
      label: 'Mentors',
      icon: <Users className="w-4 h-4" />,
      activePaths: ['/mentee/mentors', '/mentee/mentor']
    },
    {
      path: '/mentee/tasks',
      label: 'Tasks',
      icon: <BookOpen className="w-4 h-4" />,
      activePaths: ['/mentee/tasks', '/mentee/task']
    },
    {
      path: '/mentee/profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      activePaths: ['/mentee/profile']
    }
  ];

  const adminLinks: NavLink[] = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      activePaths: ['/admin/dashboard']
    },
    {
      path: '/admin/dashboard',
      label: 'Users',
      icon: <Users className="w-4 h-4" />,
      activePaths: ['/admin/dashboard']
    }
  ];

  const links = role === 'Mentor' ? mentorLinks : role === 'Mentee' ? menteeLinks : adminLinks;

  const isActive = (link: NavLink) => {
    if (!link.activePaths) return location.pathname === link.path;
    return link.activePaths.some(path => location.pathname.startsWith(path));
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src="/assets/logo.svg" alt="SlintTech Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                SlintTech
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link)
                      ? 'bg-[#008080] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.icon}
                  <span className="text-sm">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-gray-600 hover:text-[#008080] transition-colors"
            >
              Logout
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link)
                    ? 'bg-[#008080] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="text-sm font-medium text-gray-600 hover:text-[#008080] transition-colors"
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
