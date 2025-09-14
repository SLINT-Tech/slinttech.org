import { Calendar, CheckCircle, Clock, Eye, Plus, Target, User, Users, BookOpen, ArrowRight, Edit, Trash2, X, Send } from 'lucide-react';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const MentorDashboard = () => {
  const { signOut } = useAuth();
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    duration: '',
    description: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          // User is authenticated, fetch their data
          await fetchMentorData(session.user);
        } else {
          // No session, redirect to login
          navigate('/mentor/login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          navigate('/mentor/login');
        }
      } finally {
        if (mounted) {
          setAuthChecked(true);
          setLoading(false);
        }
      }
    };

    const fetchMentorData = async (user) => {
      if (!mounted) return;
      
      try {
        setError(null);

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (mounted) {
            setError('Failed to load profile data');
          }
          return;
        }

        // Verify user is a mentor
        if (profile.role !== 'Mentor') {
          navigate('/mentor/login');
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
          paymentDate: profile.payment_date
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Set mentor profile data
        if (mounted) {
          setMentorProfile({
            id: user.id,
            fullName: profile.full_name,
            email: user.email,
            specialization: profile.specialization || profile.career_path,
            status: profile.status,
            membershipEnabled: profile.membership_enabled,
            membershipAmount: profile.membership_amount,
            membershipPaid: profile.membership_paid,
            paymentReference: profile.payment_reference,
            paymentDate: profile.payment_date,
            joinedDate: profile.created_at,
            // Mock data for now - these would come from actual tables
            mentees: [],
            courses: [],
            pendingSubmissions: []
          });
        }

      } catch (error) {
        console.error('Error fetching mentor data:', error);
        if (mounted) {
          setError('Failed to load dashboard data');
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session?.user && authChecked) {
          await fetchMentorData(session.user);
        } else if (event === 'SIGNED_OUT') {
          navigate('/mentor/login');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleCreateCourse = () => {
    if (!mentorProfile) return;
    
    const course = {
      id: Date.now(), // Use timestamp as temporary ID
      ...newCourse,
      enrolledMentees: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setMentorProfile(prev => ({
      ...prev,
      courses: [...prev.courses, course]
    }));
    
    setNewCourse({ name: '', duration: '', description: '' });
    setShowCreateCourseModal(false);
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        {/* Header */}
        <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
              </Link>
              
              {/* Desktop Navigation Skeleton */}
              <div className="hidden md:flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              
              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Menu className="w-6 h-6" />
              </button>
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

          {/* Recent Courses Skeleton */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Mentees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Dashboard</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <Link 
              to="/mentor/login" 
              className="block text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No profile data
  if (!mentorProfile) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load your mentor profile.</p>
          <Link 
            to="/mentor/login" 
            className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const isPending = mentorProfile.status === 'pending';
  const totalMentees = mentorProfile.mentees.length;
  const activeMentees = mentorProfile.mentees.filter(m => m.status === 'active').length;
  const totalCourses = mentorProfile.courses.length;
  const pendingSubmissions = mentorProfile.pendingSubmissions.length;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {mentorProfile.fullName ? mentorProfile.fullName.split(' ')[0] : 'Mentor'}
              </span>
              <Link 
                to="/mentor/profile" 
                className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
              >
                Profile
              </Link>
              <Link 
                to="/mentor/login" 
               onClick={signOut}
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
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
                  Welcome, {mentorProfile.fullName ? mentorProfile.fullName.split(' ')[0] : 'Mentor'}
                </div>
                <Link 
                  to="/mentor/dashboard" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/mentor/courses" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Courses
                </Link>
                <Link 
                  to="/mentor/mentees" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Mentees
                </Link>
                <Link 
                  to="/mentor/submissions" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pending Reviews
                </Link>
                <Link 
                  to="/mentor/profile" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/mentor/login" 
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Status Banner */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Mentor Account Under Review</h3>
                <p className="text-yellow-700 mb-3">
                  Your mentor account is currently being reviewed by our admin team. You're viewing a preview of your mentor dashboard.
                  Once approved, you'll have full access to create courses, manage mentees, and all mentor features.
                </p>
                <div className="text-sm text-yellow-600">
                  <p>✓ Mentor application submitted successfully</p>
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
            Welcome Back, {mentorProfile.fullName ? mentorProfile.fullName.split(' ')[0] : 'Mentor'}!
          </h1>
          <p className="text-gray-600">
            Manage your mentees, create courses, and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#008080]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                <p className="text-2xl font-bold text-gray-900">{totalMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Mentees</p>
                <p className="text-2xl font-bold text-gray-900">{activeMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses Created</p>
                <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/mentor/courses"
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
                  <h3 className="text-lg font-semibold text-gray-900">View All Courses</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Manage all your courses'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link
            to="/mentor/mentees"
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
                  <h3 className="text-lg font-semibold text-gray-900">View All Mentees</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Manage your mentees'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link
            to="/mentor/submissions"
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
                  <h3 className="text-lg font-semibold text-gray-900">View Pending Reviews</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Review task submissions'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Courses</h2>
              {!isPending && (
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
                >
                  Create New Course
                </button>
              )}
            </div>
          </div>
          
          {totalCourses > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Mentees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mentorProfile.courses.slice(0, 5).map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center mr-3">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                            <div className="text-sm text-gray-500">{course.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.enrolledMentees} mentees
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!isPending ? (
                          <button
                            onClick={() => navigate(`/mentor/course/${course.id}`)}
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
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses created yet</h3>
              <p className="text-gray-500 mb-6">
                {isPending 
                  ? 'You can create courses once your account is approved.'
                  : 'Create your first course to start teaching and managing mentees.'
                }
              </p>
              {!isPending && (
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Create Your First Course
                </button>
              )}
            </div>
          )}
          
          {totalCourses > 5 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Link
                to="/mentor/courses"
                className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
              >
                View All {totalCourses} Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                <button
                  onClick={() => setShowCreateCourseModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., React Fundamentals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., 8 weeks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={4}
                  placeholder="Describe what this course covers..."
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowCreateCourseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;