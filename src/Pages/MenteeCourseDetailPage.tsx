import { ArrowLeft, BookOpen, Target, CheckCircle, Clock, Award, TrendingUp, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CourseDetailSkeletonLoader } from '../Components/SkeletonLoader';
import Navigation from '../Components/Navigation';
import { apiGet } from '../lib/api';

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
  deadline: string | null;
  status: string;
  createdAt: string;
  submission: TaskSubmission | null;
}

interface CourseDetail {
  id: string;
  name: string;
  description: string;
  duration: string;
  progressPercentage: number;
  enrolledAt: string;
  mentor: {
    id: string;
    name: string;
    email: string;
  };
}

interface Stats {
  totalLessons: number;
  completedLessons: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  submittedTasks: number;
}

const MenteeCourseDetailPage = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const mentorId = searchParams.get('mentorId');
  const { signOut } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.status === 'pending') {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (courseId && mentorId) {
      fetchCourseDetail();
    }
  }, [courseId, mentorId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const result = await apiGet('/mentee/courses/detail', { courseId, mentorId });
      setCourse(result.course);
      setLessons(result.lessons || []);
      setTasks(result.tasks || []);
      setStats(result.stats);
    } catch (error: any) {
      console.error('Error fetching course detail:', error);
      navigate(`/mentor-courses?mentorId=${mentorId}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTaskStatusBadge = (task: Task) => {
    const submission = task.submission;

    if (!submission) {
      const isOverdue = task.deadline && new Date(task.deadline) < new Date();
      return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          isOverdue ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          {isOverdue ? 'Overdue' : 'Not Submitted'}
        </span>
      );
    }

    const statusColors: Record<string, string> = {
      'submitted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'rejected': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${statusColors[submission.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <Navigation
        role="Mentee"
        userName={currentUser?.fullName || 'User'}
        onLogout={() => {
          signOut();
          navigate('/login');
        }}
      />

      {loading ? (
        <CourseDetailSkeletonLoader backLink={{ to: `/mentor-courses?mentorId=${mentorId}`, label: 'Back to Courses' }} />
      ) : !course ? null : (

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/mentor-courses?mentorId=${mentorId}`}
          className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">{course.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-4 transition-colors">{course.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg transition-colors">
                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors" />
                <span className="text-gray-700 dark:text-gray-300 transition-colors">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg transition-colors">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors" />
                <span className="text-gray-700 dark:text-gray-300 transition-colors">Enrolled {formatDate(course.enrolledAt)}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg transition-colors">
                <span className="text-gray-700 dark:text-gray-300 transition-colors">Mentor: {course.mentor.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#008080] dark:text-teal-400 transition-colors" />
              <span className="font-medium text-gray-900 dark:text-white transition-colors">Progress</span>
            </div>
            <span className="text-2xl font-bold text-[#008080] dark:text-teal-400 transition-colors">{course.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2 transition-colors">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${course.progressPercentage}%` }}
            />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400 transition-colors" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalLessons}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Total Lessons</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 transition-colors" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.completedLessons}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Completed</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-orange-500 dark:text-orange-400 transition-colors" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalTasks}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Total Tasks</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-teal-500 dark:text-teal-400 transition-colors" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.completedTasks}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Approved</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#008080] dark:text-teal-400 transition-colors" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Lessons</h2>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium transition-colors">
                {lessons.length}
              </span>
            </div>

            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`p-4 border rounded-lg transition-all ${
                      lesson.completed
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#008080] dark:hover:border-teal-600 hover:shadow-sm dark:hover:shadow-gray-900/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        lesson.completed ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{lesson.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors">{lesson.description}</p>
                        {lesson.link && (
                          <a
                            href={lesson.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Lesson
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600 transition-colors" />
                <p>No lessons available yet</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#008080] dark:text-teal-400 transition-colors" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Tasks</h2>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium transition-colors">
                {tasks.length}
              </span>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#008080] dark:hover:border-teal-600 hover:shadow-sm dark:hover:shadow-gray-900/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 transition-colors">{task.description}</p>
                      </div>
                      {getTaskStatusBadge(task)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {task.deadline ? (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 transition-colors">
                          <Clock className="w-3 h-3" />
                          <span>Due {formatDate(task.deadline)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 transition-colors">
                          <AlertCircle className="w-3 h-3" />
                          <span>No deadline</span>
                        </div>
                      )}
                      <Link
                        to={`/task/${task.id}`}
                        className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600 transition-colors" />
                <p>No tasks available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default MenteeCourseDetailPage;
