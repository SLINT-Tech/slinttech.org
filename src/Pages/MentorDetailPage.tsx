import { ArrowLeft, BookOpen, CheckCircle, Clock, ExternalLink, Target, User, AlertCircle, Calendar, TrendingUp, Award, XCircle, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';
import { MentorDetailSkeletonLoader } from '../Components/SkeletonLoader';

interface Lesson {
  id: string;
  title: string;
  description: string;
  link: string;
  orderIndex: number;
  status: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface TaskSubmission {
  id: string;
  submissionLink: string;
  submissionNotes: string;
  status: string;
  mentorFeedback: string;
  submittedAt: string;
  reviewedAt: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  orderIndex: number;
  createdAt: string;
  submission: TaskSubmission | null;
}

interface MentorDetail {
  id: string;
  relationshipId: string;
  fullName: string;
  email: string;
  specialization: string | null;
  courseName: string;
  courseDescription: string;
  duration: string;
  status: string;
  progressPercentage: number;
  assignedDate: string;
  notes: string | null;
  lessons: Lesson[];
  tasks: Task[];
  stats: {
    totalLessons: number;
    completedLessons: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    submittedTasks: number;
  };
}

const MentorDetailPage = () => {
  const { mentorId } = useParams();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState<MentorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (mentorId) {
      fetchMentorDetail();
    }
  }, [mentorId]);

  const fetchMentorDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/mentee-get-mentor-detail?mentorId=${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to fetch mentor details');
      }

      const result = await response.json();
      setMentorData(result.data);
    } catch (error: any) {
      console.error('Error fetching mentor detail:', error);
      setToast({
        message: error.message || 'Failed to load mentor details',
        type: 'error'
      });
      setTimeout(() => {
        navigate('/mentors');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatusBadge = (task: Task) => {
    const submission = task.submission;

    if (!submission) {
      const isOverdue = new Date(task.deadline) < new Date();
      return {
        text: isOverdue ? 'Overdue' : 'Pending',
        color: isOverdue ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: isOverdue ? AlertCircle : Clock
      };
    }

    switch (submission.status) {
      case 'approved':
        return {
          text: 'Approved',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          text: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      case 'submitted':
        return {
          text: 'Under Review',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock
        };
      default:
        return {
          text: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const progressPercentage = mentorData?.stats.totalLessons
    ? Math.round((mentorData.stats.completedLessons / mentorData.stats.totalLessons) * 100)
    : 0;


  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Welcome, {currentUser?.fullName?.split(' ')[0] || 'User'}</span>
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 font-medium">
                Dashboard
              </Link>
              <Link to="/mentors" className="text-gray-500 hover:text-gray-700 font-medium">
                My Mentors
              </Link>
              <Link to="/profile" className="text-gray-500 hover:text-gray-700 font-medium">
                Profile
              </Link>
              <button
                onClick={() => signOut('/login')}
                className="text-[#008080] hover:text-teal-700 font-medium"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4 absolute top-16 left-0 right-0 shadow-lg">
              <div className="flex flex-col space-y-4">
                <div className="px-4 py-2 text-gray-600 border-b border-gray-200">
                  Welcome, {currentUser?.fullName?.split(' ')[0] || 'User'}
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
                  to="/profile"
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut('/login');
                  }}
                  className="px-4 py-2 text-[#008080] hover:text-teal-700 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <MentorDetailSkeletonLoader />
      ) : !mentorData ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-xl shadow-sm p-8 max-w-md mx-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">This mentor is not assigned to you or the assignment does not exist.</p>
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mentors
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/mentors')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentors
        </button>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-4 ring-white/30">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{mentorData.fullName}</h1>
              <p className="text-teal-100 text-base md:text-lg mb-3">{mentorData.specialization || 'Mentor'}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs md:text-sm">Assigned {formatDate(mentorData.assignedDate)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs md:text-sm">{mentorData.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">{mentorData.stats.totalLessons}</span>
            </div>
            <p className="text-sm text-gray-600">Total Lessons</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{mentorData.stats.completedLessons}</span>
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{mentorData.stats.totalTasks}</span>
            </div>
            <p className="text-sm text-gray-600">Total Tasks</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-teal-500" />
              <span className="text-2xl font-bold text-gray-900">{mentorData.stats.completedTasks}</span>
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Course Name</label>
              <p className="text-lg text-gray-900 mt-1">{mentorData.courseName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Contact Email</label>
              <p className="text-lg text-gray-900 mt-1">{mentorData.email}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-900 mt-1">{mentorData.courseDescription}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#008080]" />
              Learning Progress
            </h2>
            <span className="text-2xl font-bold text-[#008080]">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            You've completed {mentorData.stats.completedLessons} out of {mentorData.stats.totalLessons} lessons
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#008080]" />
                Recent Lessons
              </h2>
              <Link
                to={`/lessons?mentor_id=${mentorId}`}
                className="text-[#008080] hover:text-teal-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {mentorData.lessons.length > 0 ? (
              <div className="space-y-3">
                {mentorData.lessons.slice(0, 5).map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      lesson.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
                      </div>
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <a
                          href={lesson.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008080] hover:text-teal-700"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No lessons available yet</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-[#008080]" />
                Recent Tasks
              </h2>
              <Link
                to={`/tasks?mentor_id=${mentorId}`}
                className="text-[#008080] hover:text-teal-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {mentorData.tasks.length > 0 ? (
              <div className="space-y-3">
                {mentorData.tasks.slice(0, 5).map((task) => {
                  const statusBadge = getTaskStatusBadge(task);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-teal-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        Due: {formatDate(task.deadline)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks available yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Link
            to={`/lessons?mentor_id=${mentorId}`}
            className="flex items-center justify-center gap-3 bg-[#008080] text-white px-6 py-4 rounded-xl hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">View All Lessons</span>
          </Link>
          <Link
            to={`/tasks?mentor_id=${mentorId}`}
            className="flex items-center justify-center gap-3 bg-white text-[#008080] border-2 border-[#008080] px-6 py-4 rounded-xl hover:bg-teal-50 transition-all shadow-md hover:shadow-lg"
          >
            <Target className="w-5 h-5" />
            <span className="font-semibold">View All Tasks</span>
          </Link>
        </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MentorDetailPage;
