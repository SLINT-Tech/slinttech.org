import { Calendar, CheckCircle, Clock, Eye, Plus, Target, Users, BookOpen, ArrowRight, Edit, Trash2, Send, ChevronLeft, ChevronRight, Menu, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';
import PendingBanner from '../Components/PendingBanner';

interface Course {
  id: string;
  name: string;
  duration: string;
  description: string;
  enrolledMentees: number;
  createdAt: string;
  status: string;
}

interface DashboardStats {
  totalMentees: number;
  activeMentees: number;
  totalCourses: number;
  pendingSubmissions: number;
}

const MentorDashboard = () => {
  const { signOut } = useAuth();
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalMentees: 0,
    activeMentees: 0,
    totalCourses: 0,
    pendingSubmissions: 0
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/mentor/login');
          return;
        }

        const profileResponse = await fetch('/api/auth-me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileResponse.ok) {
          console.error('Error fetching profile');
          setError('Failed to load profile data');
          setLoading(false);
          return;
        }

        const profileData = await profileResponse.json();
        const profile = profileData.profile;

        if (profile.role !== 'Mentor') {
          navigate('/mentor/login');
          return;
        }

        const membershipEnabled = profile.membershipEnabled || profile.membership_enabled;
        const membershipPaid = profile.membershipPaid || profile.membership_paid;

        if (profile.status === 'approved' && membershipEnabled && !membershipPaid) {
          navigate('/payment-wall');
          return;
        }

        const userData = {
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName || profile.full_name,
          membershipCategory: profile.membershipCategory || profile.membership_category,
          careerPath: profile.careerPath || profile.career_path,
          role: profile.role,
          status: profile.status,
          specialization: profile.specialization,
          membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
          membershipAmount: profile.membershipAmount || profile.membership_amount,
          membershipPaid: profile.membershipPaid || profile.membership_paid,
          paymentReference: profile.paymentReference || profile.payment_reference,
          paymentDate: profile.paymentDate || profile.payment_date
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));

        setMentorProfile({
          id: profile.id,
          fullName: profile.fullName || profile.full_name,
          email: profile.email,
          specialization: profile.specialization || profile.careerPath || profile.career_path,
          status: profile.status,
          membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
          membershipAmount: profile.membershipAmount || profile.membership_amount,
          membershipPaid: profile.membershipPaid || profile.membership_paid,
          paymentReference: profile.paymentReference || profile.payment_reference,
          paymentDate: profile.paymentDate || profile.payment_date,
          joinedDate: profile.createdAt || profile.created_at
        });

        const dashboardResponse = await fetch('/api/mentor-get-dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setStats(dashboardData.data.stats);
          setCourses(dashboardData.data.recentCourses || []);
        }

      } catch (error) {
        console.error('Error fetching mentor data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [navigate]);

  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
        <Navigation
          role="Mentor"
          userName={storedUser.fullName || 'Mentor'}
          onLogout={() => {
            signOut();
            navigate('/mentor/login');
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors flex items-center gap-2">
              <span>Welcome Back,</span>
              <span className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse inline-block transition-colors"></span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 transition-colors">
              Manage your mentees, create courses, and track progress
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors"></div>
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse transition-colors"></div>
                    <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-12 animate-pulse transition-colors"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-36 animate-pulse transition-colors"></div>
                  </div>
                </div>
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors"></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                  </div>
                </div>
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors"></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                  </div>
                </div>
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Recent Courses</h2>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 transition-colors">
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse transition-colors"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse transition-colors"></div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 text-center max-w-md border border-gray-200 dark:border-gray-800 transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Failed to Load Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#008080] dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <Link
              to="/mentor/login"
              className="block text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!mentorProfile) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 text-center max-w-md border border-gray-200 dark:border-gray-800 transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">Unable to load your mentor profile.</p>
          <Link
            to="/mentor/login"
            className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const isPending = mentorProfile.status === 'pending';

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      {isPending && <PendingBanner role="Mentor" />}
      <Navigation
        role="Mentor"
        userName={mentorProfile.fullName || 'Mentor'}
        onLogout={() => {
          signOut();
          navigate('/mentor/login');
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
            Welcome Back, {mentorProfile.fullName ? mentorProfile.fullName.split(' ')[0] : 'Mentor'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors">
            Manage your mentees, create courses, and track progress
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#008080] dark:text-teal-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Total Mentees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Active Mentees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.activeMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Courses Created</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {isPending ? (
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Locked</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">View All Courses</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">Manage all your courses</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
            </div>
          ) : (
            <Link
              to="/mentor/courses"
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-all border border-gray-200 dark:border-gray-800 text-left hover:shadow-md dark:hover:bg-gray-800 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">View All Courses</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">Manage all your courses</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
            </Link>
          )}

          {isPending ? (
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Locked</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4 transition-colors" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">View All Mentees</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">Manage your mentees</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
            </div>
          ) : (
            <Link
              to="/mentor/mentees"
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-all border border-gray-200 dark:border-gray-800 text-left hover:shadow-md dark:hover:bg-gray-800 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4 transition-colors" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">View All Mentees</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">Manage your mentees</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
            </Link>
          )}

          {isPending ? (
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Locked</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-4 transition-colors" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Task Submissions</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">Review mentee tasks</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
            </div>
          ) : (
            <Link
              to="/mentor/submissions"
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-all border border-gray-200 dark:border-gray-800 text-left hover:shadow-md dark:hover:bg-gray-800 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-4 transition-colors" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Task Submissions</h3>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors">Review mentee tasks</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Recent Courses</h2>
              {!isPending && (
                <Link
                  to="/mentor/courses"
                  className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium cursor-pointer transition-colors"
                >
                  View All Courses
                </Link>
              )}
            </div>
          </div>

          {stats.totalCourses > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Enrolled Mentees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 transition-colors">
                    {paginatedCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center mr-3 transition-colors">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{course.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{course.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 transition-colors">
                          {course.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 transition-colors">
                          {course.enrolledMentees} mentees
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!isPending ? (
                            <button
                              onClick={() => navigate(`/mentor/course/${course.id}`)}
                              className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 transition-colors">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                      Showing <span className="font-semibold text-gray-900 dark:text-white transition-colors">{startIndex + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white transition-colors">{Math.min(endIndex, courses.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white transition-colors">{courses.length}</span> courses
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-[40px] px-3 py-2 rounded-lg cursor-pointer font-medium transition-all ${
                                currentPage === pageNum
                                  ? 'bg-[#008080] dark:bg-teal-600 text-white shadow-md'
                                  : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4 transition-colors" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">No courses created yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors">
                {isPending
                  ? 'You can create courses once your account is approved.'
                  : 'Create your first course to start teaching and managing mentees.'
                }
              </p>
              {!isPending && (
                <Link
                  to="/mentor/courses"
                  className="inline-block bg-[#008080] dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer"
                >
                  Go to Courses
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
