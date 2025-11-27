import { Calendar, CheckCircle, Clock, Eye, Plus, Target, Users, BookOpen, ArrowRight, Edit, Trash2, Send, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';

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

        if (profile.status === 'pending') {
          navigate('/pending-approval');
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
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <Navigation
          role="Mentor"
          userName="Loading..."
          onLogout={() => {
            signOut();
            navigate('/mentor/login');
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-7 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-36 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
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
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md border border-gray-200">
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

  if (!mentorProfile) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md border border-gray-200">
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

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navigation
        role="Mentor"
        userName={mentorProfile.fullName || 'Mentor'}
        onLogout={() => {
          signOut();
          navigate('/mentor/login');
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, {mentorProfile.fullName ? mentorProfile.fullName.split(' ')[0] : 'Mentor'}!
          </h1>
          <p className="text-gray-600">
            Manage your mentees, create courses, and track progress
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#008080]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Mentees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses Created</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/mentor/courses"
            className={`bg-white rounded-xl shadow-sm p-6 transition-all border border-gray-200 text-left ${
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
            className={`bg-white rounded-xl shadow-sm p-6 transition-all border border-gray-200 text-left ${
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
            className={`bg-white rounded-xl shadow-sm p-6 transition-all border border-gray-200 text-left ${
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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Courses</h2>
              {!isPending && (
                <Link
                  to="/mentor/courses"
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
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
                    {paginatedCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
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

              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(endIndex, courses.length)}</span> of <span className="font-semibold text-gray-900">{courses.length}</span> courses
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
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
                                  ? 'bg-[#008080] text-white shadow-md'
                                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
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
                        className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
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
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses created yet</h3>
              <p className="text-gray-500 mb-6">
                {isPending
                  ? 'You can create courses once your account is approved.'
                  : 'Create your first course to start teaching and managing mentees.'
                }
              </p>
              {!isPending && (
                <Link
                  to="/mentor/courses"
                  className="inline-block bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
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
