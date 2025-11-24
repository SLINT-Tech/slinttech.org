import { Calendar, CheckCircle, Clock, ExternalLink, FileText, MessageSquare, User, Users, BookOpen, Target, ArrowRight } from 'lucide-react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CardSkeletonLoader } from '../Components/SkeletonLoader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const MenteeDashboard = () => {
  const { signOut } = useAuth();
  const [menteeData, setMenteeData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [lessonsData, setLessonsData] = useState({ completed: 0, total: 0 });
  const [tasksData, setTasksData] = useState({ approved: 0, total: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Check if current user is mentee
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isMentee = currentUser.role === 'Mentee';
  const isPending = currentUser?.status === 'pending';

  useEffect(() => {
    if (!isMentee) {
      return;
    }

    fetchProfileData();
  }, [isMentee]);

  const fetchProfileData = async () => {
    if (!isMentee) return;

    try {
      setIsLoadingProfile(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth-me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
          return;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }
        throw new Error('Failed to fetch profile');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response:', contentType);
        throw new Error('Invalid response from server');
      }

      const profile = await response.json();

      const userData = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        membershipCategory: profile.membershipCategory,
        careerPath: profile.careerPath,
        role: profile.role,
        status: profile.status,
        specialization: profile.specialization,
        membershipEnabled: profile.membershipEnabled,
        membershipAmount: profile.membershipAmount,
        membershipPaid: profile.membershipPaid,
        paymentReference: profile.paymentReference,
        paymentDate: profile.paymentDate,
        discordLink: profile.discordLink
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));

      const mockLessons = [
        { id: 1, completed: true },
        { id: 2, completed: false },
        { id: 3, completed: true }
      ];

      setLessonsData({
        completed: mockLessons.filter(l => l.completed).length,
        total: mockLessons.length
      });

      const mockTasks = [
        { id: 1, status: 'approved' },
        { id: 2, status: 'pending' },
        { id: 3, status: 'approved' },
        { id: 4, status: 'rejected' }
      ];

      setTasksData({
        approved: mockTasks.filter(t => t.status === 'approved').length,
        total: mockTasks.length
      });

      setMenteeData({
        fullName: profile.fullName,
        email: profile.email,
        membershipCategory: profile.membershipCategory,
        careerPath: profile.careerPath,
        status: profile.status,
        discordLink: profile.discordLink,
        membershipEnabled: profile.membershipEnabled,
        membershipAmount: profile.membershipAmount,
        membershipPaid: profile.membershipPaid,
        paymentReference: profile.paymentReference,
        paymentDate: profile.paymentDate,
        mentorAssignments: [
          {
            mentor: 'Dr. Sarah Johnson - Full Stack Development',
            courseName: 'React Fundamentals',
            duration: '8 weeks',
            mentorEmail: 'sarah.johnson@slinttech.org',
            mentorPhone: '+1 (555) 123-4567'
          }
        ],
        announcements: [
          {
            id: 1,
            title: 'Welcome to SlintTech!',
            message: 'Your account has been created successfully. Welcome to our community!',
            date: new Date().toISOString().split('T')[0],
            type: 'info'
          }
        ]
      });

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Active';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Unknown';
    }
  };

  // Access control
  if (!isMentee) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Link to="/login" className="text-[#008080] hover:text-teal-700 font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:flex">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {menteeData?.fullName?.split(' ')[0] || currentUser.fullName?.split(' ')[0] || 'User'}
              </span>
              <Link 
                to="/profile" 
                className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
              >
                Profile
              </Link>
              <Link 
                to="/login" 
                onClick={signOut}
                className="text-[#008080] hover:text-teal-700 font-medium"
              >
                Logout
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4 absolute top-16 left-0 right-0 shadow-lg">
              <div className="flex flex-col space-y-4">
                <div className="px-4 py-2 text-gray-600 border-b border-gray-200">
                  Welcome, {menteeData?.fullName?.split(' ')[0] || currentUser.fullName?.split(' ')[0] || 'User'}
                </div>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/mentors" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Mentors
                </Link>
                <Link 
                  to="/lessons" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Lessons
                </Link>
                <Link 
                  to="/tasks" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Tasks
                </Link>
                <Link 
                  to="/profile" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors border-t border-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Always rendered */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingProfile ? (
          <CardSkeletonLoader />
        ) : (
          <div>Dashboard content</div>
        )}
      </div>
    </div>
  );
};

export default MenteeDashboard;
