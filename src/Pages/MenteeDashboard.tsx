import { Calendar, CheckCircle, Clock, Eye, Plus, Target, User, Users, BookOpen, ArrowRight, Edit, Trash2, X, Send } from 'lucide-react';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Mock data - this would come from your backend/database
const mockMenteeData = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  membershipCategory: 'Student',
  careerPath: 'Full Stack Development',
  status: 'approved',
  joinedDate: '2024-01-15',
  mentors: [
    {
      id: 'gfyffa54afvctrdt',
      fullName: 'Dr. Sarah Johnson',
      specialization: 'Full Stack Development',
      email: 'sarah.johnson@slinttech.org',
      phone: '+1 (555) 123-4567',
      courseName: 'React Fundamentals',
      duration: '8 weeks',
      lessonsCount: 3,
      tasksCount: 2,
      completedLessons: 1,
      approvedTasks: 0
    },
    {
      id: 'hgkjh67890mnbvcx',
      fullName: 'Prof. Michael Chen',
      specialization: 'Frontend Development',
      email: 'michael.chen@slinttech.org',
      phone: '+1 (555) 987-6543',
      courseName: 'Advanced CSS & Animations',
      duration: '6 weeks',
      lessonsCount: 1,
      tasksCount: 3,
      completedLessons: 0,
      approvedTasks: 2
    }
  ],
  recentLessons: [
    {
      id: 1,
      title: 'Introduction to React Components',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      completed: false,
      dueDate: '2024-02-01'
    },
    {
      id: 2,
      title: 'State Management with useState',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      completed: true,
      dueDate: '2024-01-28'
    },
    {
      id: 3,
      title: 'CSS Grid Layout Mastery',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      completed: false,
      dueDate: '2024-02-05'
    }
  ],
  recentTasks: [
    {
      id: 1,
      title: 'Build a Todo App with React',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      status: 'pending',
      deadline: '2024-02-15',
      isOverdue: false
    },
    {
      id: 2,
      title: 'Responsive Portfolio Website',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      status: 'approved',
      deadline: '2024-02-20',
      isOverdue: false
    },
    {
      id: 3,
      title: 'API Integration Exercise',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      status: 'rejected',
      deadline: '2024-02-10',
      isOverdue: true
    }
  ]
};

const MenteeDashboard = () => {
  const { user, profile, loading, signOut, hasInitialData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [menteeData, setMenteeData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenteeData = async () => {
      if (!user || !profile || profile.role !== 'Mentee') {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      
      try {
        // Simulate fetching mentee-specific data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set mentee data from profile and mock data
        setMenteeData({
          ...mockMenteeData,
          fullName: profile.full_name,
          email: user.email,
          membershipCategory: profile.membership_category,
          careerPath: profile.career_path,
          status: profile.status,
          joinedDate: profile.created_at
        });
      } catch (error) {
        console.error('Error fetching mentee data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMenteeData();
  }, [user, profile]);

  useEffect(() => {
    // Only redirect if auth is fully loaded and no user exists
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    // Only redirect if auth is fully loaded and user is not a mentee
    if (!loading && user && profile && profile.role !== 'Mentee') {
      navigate('/login');
      return;
    }

    // Check payment requirements only for approved mentees
    if (!loading && user && profile && profile.role === 'Mentee' && profile.status === 'approved') {
      if (profile.membership_enabled && !profile.membership_paid) {
        navigate('/payment-wall');
        return;
      }
    }
  }, [user, profile, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Show loading skeleton when auth is loading OR data is loading
  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        {/* Header Skeleton */}
        <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
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
              </div>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Lessons Skeleton */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded mr-3 animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-40 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Tasks Skeleton */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded mr-3 animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-40 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not a mentee (only after all loading is complete)
  if (!user || !profile || profile.role !== 'Mentee' || !menteeData) {
    return null;
  }

  const isPending = menteeData.status === 'pending';
  const totalMentors = menteeData.mentors.length;
  const totalLessons = menteeData.recentLessons.length;
  const completedLessons = menteeData.recentLessons.filter(lesson => lesson.completed).length;
  const totalTasks = menteeData.recentTasks.length;
  const approvedTasks = menteeData.recentTasks.filter(task => task.status === 'approved').length;

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {menteeData.fullName ? menteeData.fullName.split(' ')[0] : 'Student'}
              </span>
              <Link 
                to="/profile" 
                className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
              >
                Logout
              </button>
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
                  Welcome, {menteeData.fullName ? menteeData.fullName.split(' ')[0] : 'Student'}
                </div>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/lessons" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Lessons
                </Link>
                <Link 
                  to="/tasks" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tasks
                </Link>
                <Link 
                  to="/mentors" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mentors
                </Link>
                <Link 
                  to="/profile" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors border-t border-gray-200 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
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
                  Once approved, you'll have full access to all features and can start your learning journey.
                </p>
                <div className="text-sm text-yellow-600">
                  <p>✓ Registration completed successfully</p>
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
            Welcome Back, {menteeData.fullName ? menteeData.fullName.split(' ')[0] : 'Student'}!
          </h1>
          <p className="text-gray-600">
            {isPending 
              ? 'Here\'s a preview of your learning dashboard. Full access will be available once your account is approved.'
              : 'Continue your learning journey and track your progress with your mentors.'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#008080]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Mentors</p>
                <p className="text-2xl font-bold text-gray-900">{totalMentors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lessons</p>
                <p className="text-2xl font-bold text-gray-900">{completedLessons}/{totalLessons}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{approvedTasks}/{totalTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/lessons"
            className={`bg-white rounded-xl shadow-sm p-6 transition-shadow text-left ${
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
                  <h3 className="text-lg font-semibold text-gray-900">View All Lessons</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Access your learning materials'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link
            to="/tasks"
            className={`bg-white rounded-xl shadow-sm p-6 transition-shadow text-left ${
              isPending 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:shadow-md cursor-pointer'
            }`}
            onClick={isPending ? (e) => e.preventDefault() : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-yellow-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View All Tasks</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Submit your assignments'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link
            to="/mentors"
            className={`bg-white rounded-xl shadow-sm p-6 transition-shadow text-left ${
              isPending 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:shadow-md cursor-pointer'
            }`}
            onClick={isPending ? (e) => e.preventDefault() : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View All Mentors</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Connect with your mentors'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Lessons */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Recent Lessons</h2>
                {!isPending && (
                  <Link to="/lessons" className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer">
                    View All
                  </Link>
                )}
              </div>
            </div>
            
            {menteeData.recentLessons.length > 0 ? (
              <div className="p-6">
                <div className="space-y-4">
                  {menteeData.recentLessons.slice(0, 3).map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center mr-3">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                          <p className="text-sm text-gray-500">{lesson.mentor} • {lesson.course}</p>
                        </div>
                      </div>
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons yet</h3>
                <p className="text-gray-500">
                  {isPending 
                    ? 'Lessons will appear here once your account is approved and mentors assign them.'
                    : 'Your mentors will add lessons for you to complete. Check back later!'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
                {!isPending && (
                  <Link to="/tasks" className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer">
                    View All
                  </Link>
                )}
              </div>
            </div>
            
            {menteeData.recentTasks.length > 0 ? (
              <div className="p-6">
                <div className="space-y-4">
                  {menteeData.recentTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-500">{task.mentor} • Due: {new Date(task.deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTaskStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-500">
                  {isPending 
                    ? 'Tasks will appear here once your account is approved and mentors assign them.'
                    : 'Your mentors will assign tasks for you to complete. Check back later!'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* My Mentors Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Mentors</h2>
              {!isPending && (
                <Link to="/mentors" className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer">
                  View All
                </Link>
              )}
            </div>
          </div>
          
          {menteeData.mentors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menteeData.mentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{mentor.fullName}</div>
                            <div className="text-sm text-gray-500">{mentor.specialization}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mentor.courseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mentor.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          <div>Lessons: {mentor.completedLessons}/{mentor.lessonsCount}</div>
                          <div>Tasks: {mentor.approvedTasks}/{mentor.tasksCount}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!isPending ? (
                          <button
                            onClick={() => navigate(`/mentor/${mentor.id}`)}
                            className="text-[#008080] hover:text-teal-700 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-gray-400">
                            <Eye className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors assigned yet</h3>
              <p className="text-gray-500">
                {isPending 
                  ? 'Mentors will be assigned to you once your account is approved by our admin team.'
                  : 'Your mentors will appear here once they are assigned by an admin.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeDashboard;