import { Calendar, CheckCircle, Clock, ExternalLink, FileText, MessageSquare, User, Users, BookOpen, Target, ArrowRight } from 'lucide-react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const MenteeDashboard = () => {
  const { signOut } = useAuth();
  const [menteeData, setMenteeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonsData, setLessonsData] = useState({ completed: 0, total: 0 });
  const [tasksData, setTasksData] = useState({ approved: 0, total: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  
  // Get current user status from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isPending = currentUser.status === 'pending';

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await handleAuthenticatedUser(session.user);
        } else {
          if (mounted) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const handleAuthenticatedUser = async (user) => {
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // Update localStorage with fresh data
        const userData = {
          id: user.id,
          email: user.email,
          fullName: profile.full_name,
          membershipCategory: profile.membership_category,
          careerPath: profile.career_path,
          role: profile.role,
          status: profile.status,
          specialization: profile.specialization,
          membershipEnabled: profile.membership_enabled,
          membershipAmount: profile.membership_amount,
          membershipPaid: profile.membership_paid,
          paymentReference: profile.payment_reference,
  }, [navigate, authInitialized]);
          paymentDate: profile.payment_date,
          discordLink: profile.discord_link
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Fetch lessons data (mock for now - replace with real Supabase query)
        // TODO: Replace with actual lessons table query
        // const { data: lessons } = await supabase
        //   .from('lessons')
        //   .select('id, completed')
        //   .eq('mentee_id', user.id);
        
        // Mock lessons data for now
        const mockLessons = [
          { id: 1, completed: true },
          { id: 2, completed: false },
          { id: 3, completed: true }
        ];
        
        if (mounted) {
          setLessonsData({
            completed: mockLessons.filter(l => l.completed).length,
            total: mockLessons.length
          });
        }

        // Fetch tasks data (mock for now - replace with real Supabase query)
        // TODO: Replace with actual tasks table query
        // const { data: tasks } = await supabase
        //   .from('tasks')
        //   .select('id, status')
        //   .eq('mentee_id', user.id);
        
        // Mock tasks data for now
        const mockTasks = [
          { id: 1, status: 'approved' },
          { id: 2, status: 'pending' },
          { id: 3, status: 'approved' },
          { id: 4, status: 'rejected' }
        ];
        
        if (mounted) {
          setTasksData({
            approved: mockTasks.filter(t => t.status === 'approved').length,
            total: mockTasks.length
          });
        }

        // Set mentee data with real user info
        if (mounted) {
          setMenteeData({
            fullName: profile.full_name,
            email: user.email,
            membershipCategory: profile.membership_category,
            careerPath: profile.career_path,
            status: profile.status,
            discordLink: profile.discord_link,
            membershipEnabled: profile.membership_enabled,
            membershipAmount: profile.membership_amount,
            membershipPaid: profile.membership_paid,
            paymentReference: profile.payment_reference,
            paymentDate: profile.payment_date,
            mentorAssignments: [
              // TODO: Replace with actual mentor assignments from database
              {
                mentor: 'Dr. Sarah Johnson - Full Stack Development',
                courseName: 'React Fundamentals',
                duration: '8 weeks',
                mentorEmail: 'sarah.johnson@slinttech.org',
                mentorPhone: '+1 (555) 123-4567'
              }
            ],
            announcements: [
              // TODO: Replace with actual announcements from database
              {
                id: 1,
                title: 'Welcome to SlintTech!',
                message: 'Your account has been created successfully. Welcome to our community!',
                date: new Date().toISOString().split('T')[0],
                type: 'info'
              }
            ]
          });
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
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

      {/* Loading State with Skeleton */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>

          {/* Overview Panel Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-24 mb-6 animate-pulse"></div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="flex items-center mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Cards Skeleton */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded mr-4 animate-pulse"></div>
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="mt-4">
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Community Discord Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded mr-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
              </div>
            </div>

            {/* Recent Announcements Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded mr-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border-l-4 border-gray-200 p-4 rounded-r-lg bg-gray-50">
                    <div className="h-4 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && !menteeData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h1>
            <p className="text-gray-600 mb-4">Please try refreshing the page or contact support.</p>
            <Link to="/login" className="text-[#008080] hover:text-teal-700 cursor-pointer">
              Back to Login
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && menteeData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Pending Status Banner */}
          {isPending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Account Under Review</h3>
                  <p className="text-yellow-700 mb-3">
                    Your account is currently being reviewed by our admin team. You're viewing a preview of your dashboard.
                    Once approved, you'll have full access to all features including lessons, tasks, and community Discord.
                  </p>
                  <div className="text-sm text-yellow-600">
                    <p>✓ Application submitted successfully</p>
                    <p>⏳ Admin review in progress</p>
                    <p>📧 You'll receive an email notification once approved</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back, {menteeData.fullName?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">
              Track your progress, complete lessons, and submit tasks
            </p>
          </div>

          {/* Overview Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Progress Stats */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lessons Progress</h3>
                <div className="flex items-center mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${lessonsData.total > 0 ? (lessonsData.completed / lessonsData.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {lessonsData.completed}/{lessonsData.total}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Lessons completed</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tasks Progress</h3>
                <div className="flex items-center mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tasksData.total > 0 ? (tasksData.approved / tasksData.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {tasksData.approved}/{tasksData.total}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Tasks approved</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(menteeData.status)}`}>
                  {getStatusText(menteeData.status)}
                </div>
                <p className="text-xs text-gray-500 mt-1">{menteeData.careerPath}</p>
              </div>
            </div>
            
            {/* Mentor Contact Info */}
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link 
              to="/mentors" 
              className={`bg-white rounded-xl shadow-sm p-6 transition-shadow ${
                isPending 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-md cursor-pointer'
              }`}
              onClick={isPending ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-[#008080] mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Mentors</h3>
                    <p className="text-gray-600">
                      {isPending ? 'Available after approval' : 'View your assigned mentors'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {isPending ? 'Pending approval' : `${menteeData.mentorAssignments.length} mentors assigned`}
              </div>
            </Link>

            <Link 
              to="/lessons" 
              className={`bg-white rounded-xl shadow-sm p-6 transition-shadow ${
                isPending 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-md cursor-pointer'
              }`}
              onClick={isPending ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-[#008080] mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">All Lessons</h3>
                    <p className="text-gray-600">
                      {isPending ? 'Available after approval' : 'View and complete your lessons'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {isPending ? 'Pending approval' : `${lessonsData.completed} of ${lessonsData.total} lessons completed`}
              </div>
            </Link>

            <Link 
              to="/tasks" 
              className={`bg-white rounded-xl shadow-sm p-6 transition-shadow ${
                isPending 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-md cursor-pointer'
              }`}
              onClick={isPending ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-[#008080] mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
                    <p className="text-gray-600">
                      {isPending ? 'Available after approval' : 'Submit and track your assignments'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {isPending ? 'Pending approval' : `${tasksData.approved} of ${tasksData.total} tasks approved`}
              </div>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Community Discord */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Community Discord</h2>
              </div>
              
              {menteeData.discordLink && !isPending ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Join our Discord community to connect with other members and mentors.
                  </p>
                  <a
                    href={menteeData.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-4 py-2 rounded-lg hover:bg-[#4752C4] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Join Discord Server
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {isPending ? 'Discord access available after approval' : 'Discord invite not available yet'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isPending 
                      ? 'Complete the approval process to join our community'
                      : 'You\'ll receive a Discord invite once your membership is approved'
                    }
                  </p>
                </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Announcements</h2>
              </div>
              
              {menteeData.announcements?.length > 0 ? (
                <div className="space-y-4">
                  {menteeData.announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className={`border-l-4 p-4 rounded-r-lg ${
                      announcement.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-[#008080] bg-gray-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                          <p className="text-gray-600 mb-2">{announcement.message}</p>
                          <p className="text-xs text-gray-500">{announcement.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No announcements yet</p>
                  <p className="text-sm text-gray-400">
                    Check back later for updates and announcements
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenteeDashboard;
