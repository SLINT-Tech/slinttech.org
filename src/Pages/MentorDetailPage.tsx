import { ArrowLeft, BookOpen, CheckCircle, Clock, ExternalLink, Target, User, AlertCircle, Calendar, TrendingUp, Award, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';
import { MentorDetailSkeletonLoader } from '../Components/SkeletonLoader';
import Navigation from '../Components/Navigation';

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
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentorId');
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState<MentorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.status === 'pending') {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

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

      console.log('Fetching mentor detail for mentorId:', mentorId);
      const response = await fetch(`/api/mentee-get-mentor-detail?mentorId=${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to fetch mentor details');
      }

      const result = await response.json();
      console.log('API result:', result);

      if (result.success && result.data) {
        setMentorData(result.data);
        console.log('Mentor data set:', result.data);
      } else {
        throw new Error('Invalid response format');
      }
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
        color: isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: isOverdue ? AlertCircle : Clock
      };
    }

    switch (submission.status) {
      case 'approved':
        return {
          text: 'Approved',
          color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          text: 'Rejected',
          color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
          icon: XCircle
        };
      case 'submitted':
        return {
          text: 'Under Review',
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          icon: Clock
        };
      default:
        return {
          text: 'Pending',
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
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
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950">
      <Navigation
        role="Mentee"
        userName={currentUser?.fullName || 'User'}
        onLogout={() => {
          signOut();
          navigate('/login');
        }}
      />

      {loading ? (
        <MentorDetailSkeletonLoader backLink={{ to: '/mentors', label: 'Back to Mentors' }} />
      ) : !mentorData ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 max-w-md mx-4">
            <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This mentor is not assigned to you or the assignment does not exist.</p>
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 bg-[#008080] dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mentors
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/mentors"
          className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentors
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-8 mb-8 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10 text-[#008080] dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">{mentorData.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-3">{mentorData.specialization || 'Mentor'}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Assigned {formatDate(mentorData.assignedDate)}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">{mentorData.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{mentorData.stats.totalLessons}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{mentorData.stats.completedLessons}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{mentorData.stats.totalTasks}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-teal-500 dark:text-teal-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{mentorData.stats.completedTasks}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Course Name</label>
              <p className="text-lg text-gray-900 dark:text-white mt-1">{mentorData.courseName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Email</label>
              <p className="text-lg text-gray-900 dark:text-white mt-1">{mentorData.email}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
              <p className="text-gray-900 dark:text-gray-300 mt-1">{mentorData.courseDescription}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#008080] dark:text-teal-400" />
              Learning Progress
            </h2>
            <span className="text-2xl font-bold text-[#008080] dark:text-teal-400">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-500 h-3 rounded-full transition-all duration-500 shadow-md dark:shadow-gray-900/30"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You've completed {mentorData.stats.completedLessons} out of {mentorData.stats.totalLessons} lessons
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#008080] dark:text-teal-400" />
                Recent Lessons
              </h2>
              <Link
                to={`/lessons?mentor_id=${mentorId}`}
                className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium transition-colors"
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
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{lesson.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{lesson.description}</p>
                      </div>
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <a
                          href={lesson.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
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
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No lessons available yet</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-[#008080] dark:text-teal-400" />
                Recent Tasks
              </h2>
              <Link
                to={`/tasks?mentor_id=${mentorId}`}
                className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium transition-colors"
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
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all bg-white dark:bg-gray-800/50"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white flex-1">{task.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Due: {formatDate(task.deadline)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No tasks available yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Link
            to={`/lessons?mentor_id=${mentorId}`}
            className="flex items-center justify-center gap-3 bg-[#008080] dark:bg-teal-600 text-white px-6 py-4 rounded-xl hover:bg-teal-700 dark:hover:bg-teal-500 transition-all shadow-md hover:shadow-lg dark:shadow-gray-900/30"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">View All Lessons</span>
          </Link>
          <Link
            to={`/tasks?mentor_id=${mentorId}`}
            className="flex items-center justify-center gap-3 bg-white dark:bg-gray-900 text-[#008080] dark:text-teal-400 border-2 border-[#008080] dark:border-teal-600 px-6 py-4 rounded-xl hover:bg-teal-50 dark:hover:bg-gray-800 transition-all shadow-md hover:shadow-lg dark:shadow-gray-900/30"
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
