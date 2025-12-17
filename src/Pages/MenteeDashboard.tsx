import { Calendar, CheckCircle, Clock, ExternalLink, FileText, MessageSquare, User, Users, BookOpen, Target, ArrowRight, Lock } from 'lucide-react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';
import PendingBanner from '../Components/PendingBanner';
import { apiGet } from '../lib/api';

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

        const response = await apiGet('/auth-me');

        if (!response.ok) {
          console.error('Error fetching profile');
          setLoading(false);
          return;
        }

        const data = await response.json();
        const profile = data.profile;

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
          communityLink: profile.communityLink || profile.community_link
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));

        const dashboardResponse = await apiGet('/mentee-get-dashboard');

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
            communityLink: profile.communityLink || profile.community_link,
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
            communityLink: profile.communityLink || profile.community_link,
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
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 transition-colors';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 transition-colors';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800 transition-colors';
      case 'suspended':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 transition-colors';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 transition-colors';
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
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      {isPending && <PendingBanner role="Mentee" />}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors flex items-center gap-2">
              <span>Welcome Back,</span>
              <span className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse inline-block transition-colors"></span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">
              Track your progress, complete lessons, and submit tasks
            </p>
          </div>

          {/* Overview Panel Skeleton */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 border border-transparent dark:border-gray-800">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-6 animate-pulse"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Cards Skeleton */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-40 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Bottom Section Skeleton */}
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-40 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && !menteeData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 text-center border border-transparent dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please try refreshing the page or contact support.</p>
            <Link to="/login" className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && menteeData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
              Welcome Back, {menteeData.fullName?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">
              Track your progress, complete lessons, and submit tasks
            </p>
          </div>

          {/* Overview Panel */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 border border-transparent dark:border-gray-800 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors">Overview</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Progress Stats */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">Lessons Progress</h3>
                <div className="flex items-center mb-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3 transition-colors">
                    <div
                      className="bg-[#008080] dark:bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${lessonsData.total > 0 ? (lessonsData.completed / lessonsData.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                    {lessonsData.completed}/{lessonsData.total}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Lessons completed</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">Tasks Progress</h3>
                <div className="flex items-center mb-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3 transition-colors">
                    <div
                      className="bg-yellow-500 dark:bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tasksData.total > 0 ? (tasksData.approved / tasksData.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                    {tasksData.approved}/{tasksData.total}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Tasks approved</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">Status</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(menteeData.status)}`}>
                  {getStatusText(menteeData.status)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">{menteeData.careerPath}</p>
              </div>
            </div>

            {/* Mentor Contact Info */}
          </div>

          {/* Quick Access Cards */}
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
                    <Users className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">My Mentors</h3>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">View your assigned mentors</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  0 mentors assigned
                </div>
              </div>
            ) : (
              <Link
                to="/mentors"
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-800 transition-all hover:shadow-md dark:hover:border-gray-700 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">My Mentors</h3>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">View your assigned mentors</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  {menteeData.mentorAssignments.length} mentors assigned
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
                    <BookOpen className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">All Lessons</h3>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">View and complete your lessons</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  0 of 0 lessons completed
                </div>
              </div>
            ) : (
              <Link
                to="/lessons"
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-800 transition-all hover:shadow-md dark:hover:border-gray-700 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">All Lessons</h3>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">View and complete your lessons</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  {lessonsData.completed} of {lessonsData.total} lessons completed
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
                    <Target className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">All Tasks</h3>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">Submit and track your assignments</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  0 of 0 tasks approved
                </div>
              </div>
            ) : (
              <Link
                to="/tasks"
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-800 transition-all hover:shadow-md dark:hover:border-gray-700 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-4 transition-colors" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">All Tasks</h3>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">Submit and track your assignments</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  {tasksData.approved} of {tasksData.total} tasks approved
                </div>
              </Link>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Community Slack */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-800 transition-colors overflow-hidden">
              {isPending && (
                <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Locked</span>
                  </div>
                </div>
              )}
              <div className="flex items-center mb-4">
                <MessageSquare className="w-6 h-6 text-[#008080] dark:text-teal-400 mr-2 transition-colors" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Community Slack</h2>
              </div>

              {menteeData.communityLink && !isPending ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors">
                    Join our Slack workspace to connect with other members and mentors.
                  </p>
                  <a
                    href={menteeData.communityLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#4A154B] dark:bg-[#4A154B] text-white px-4 py-2 rounded-lg hover:bg-[#3A0F3B] dark:hover:bg-[#3A0F3B] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Join Slack Workspace
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 transition-colors" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors">
                    {isPending ? 'Slack access available after approval' : 'Slack invite not available yet'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors">
                    {isPending
                      ? 'Complete the approval process to join our community'
                      : 'You\'ll receive a Slack invite once your membership is approved'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Recent Announcements */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-800 transition-colors">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-[#008080] dark:text-teal-400 mr-2 transition-colors" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">Recent Announcements</h2>
              </div>

              {menteeData.announcements?.length > 0 ? (
                <div className="space-y-4">
                  {menteeData.announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className={`border-l-4 p-4 rounded-r-lg transition-colors ${announcement.type === 'warning'
                        ? 'border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-[#008080] dark:border-teal-400 bg-gray-50 dark:bg-gray-800'
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{announcement.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2 transition-colors">{announcement.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors">{announcement.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 transition-colors" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors">No announcements yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors">
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
