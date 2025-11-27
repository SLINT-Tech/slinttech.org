import { Calendar, CheckCircle, Clock, ExternalLink, FileText, MessageSquare, User, Users, BookOpen, Target, ArrowRight } from 'lucide-react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';

const MenteeDashboard = () => {
  const { signOut } = useAuth();
  const [menteeData, setMenteeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonsData, setLessonsData] = useState({ completed: 0, total: 0 });
  const [tasksData, setTasksData] = useState({ approved: 0, total: 0 });
  const navigate = useNavigate();
  
  // Get current user status from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isPending = currentUser.status === 'pending';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/auth-me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('Error fetching profile');
          setLoading(false);
          return;
        }

        const data = await response.json();
        const profile = data.profile;

        // Check if user should be redirected elsewhere
        if (profile.status === 'pending') {
          navigate('/pending-approval');
          return;
        }

        // Check payment requirement - handle both camelCase and snake_case
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
          paymentDate: profile.paymentDate || profile.payment_date,
          discordLink: profile.discordLink || profile.discord_link
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));

        const dashboardResponse = await fetch('/api/mentee-get-dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          const { mentorAssignments, lessonsData, tasksData, announcements } = dashboardData.data;

          setLessonsData(lessonsData);
          setTasksData(tasksData);

          setMenteeData({
            fullName: profile.fullName || profile.full_name,
            email: profile.email,
            membershipCategory: profile.membershipCategory || profile.membership_category,
            careerPath: profile.careerPath || profile.career_path,
            status: profile.status,
            discordLink: profile.discordLink || profile.discord_link,
            membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
            membershipAmount: profile.membershipAmount || profile.membership_amount,
            membershipPaid: profile.membershipPaid || profile.membership_paid,
            paymentReference: profile.paymentReference || profile.payment_reference,
            paymentDate: profile.paymentDate || profile.payment_date,
            mentorAssignments: mentorAssignments,
            announcements: announcements
          });
        } else {
          setLessonsData({ completed: 0, total: 0 });
          setTasksData({ approved: 0, total: 0 });

          setMenteeData({
            fullName: profile.fullName || profile.full_name,
            email: profile.email,
            membershipCategory: profile.membershipCategory || profile.membership_category,
            careerPath: profile.careerPath || profile.career_path,
            status: profile.status,
            discordLink: profile.discordLink || profile.discord_link,
            membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
            membershipAmount: profile.membershipAmount || profile.membership_amount,
            membershipPaid: profile.membershipPaid || profile.membership_paid,
            paymentReference: profile.paymentReference || profile.payment_reference,
            paymentDate: profile.paymentDate || profile.payment_date,
            mentorAssignments: [],
            announcements: []
          });
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
      <Navigation
        role="Mentee"
        userName={menteeData?.fullName || currentUser.fullName || 'User'}
        onLogout={() => {
          signOut();
          navigate('/login');
        }}
      />

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
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Bottom Section Skeleton */}
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
            ))}
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
              )}
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
