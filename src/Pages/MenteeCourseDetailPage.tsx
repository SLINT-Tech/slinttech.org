import { ArrowLeft, BookOpen, Target, CheckCircle, Clock, Award, TrendingUp, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CourseDetailSkeletonLoader } from '../Components/SkeletonLoader';
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
  }, []);

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

      const response = await fetch(`/api/mentee-get-course-detail?courseId=${courseId}&mentorId=${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to fetch course details');
      }

      const result = await response.json();
      setCourse(result.data.course);
      setLessons(result.data.lessons || []);
      setTasks(result.data.tasks || []);
      setStats(result.data.stats);
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
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isOverdue ? 'Overdue' : 'Pending'}
        </span>
      );
    }

    const statusColors: Record<string, string> = {
      'submitted': 'bg-blue-100 text-blue-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[submission.status] || 'bg-gray-100 text-gray-700'}`}>
        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navigation
        role="Mentee"
        userName={currentUser?.fullName || 'User'}
        onLogout={() => {
          signOut();
          navigate('/login');
        }}
      />

      {loading ? (
        <CourseDetailSkeletonLoader />
      ) : !course ? null : (

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/mentor-courses?mentorId=${mentorId}`}
          className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-200">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{course.name}</h1>
            <p className="text-gray-600 text-base md:text-lg mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Enrolled {formatDate(course.enrolledAt)}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                <span className="text-gray-700">Mentor: {course.mentor.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#008080]" />
              <span className="font-medium text-gray-900">Progress</span>
            </div>
            <span className="text-2xl font-bold text-[#008080]">{course.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${course.progressPercentage}%` }}
            />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalLessons}</span>
              </div>
              <p className="text-sm text-gray-600">Total Lessons</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.completedLessons}</span>
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalTasks}</span>
              </div>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-teal-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.completedTasks}</span>
              </div>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#008080]" />
              <h2 className="text-xl font-bold text-gray-900">Lessons</h2>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
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
                        ? 'bg-green-50 border-green-200'
                        : 'border-gray-200 hover:border-[#008080] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        lesson.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                        {lesson.link && (
                          <a
                            href={lesson.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-[#008080] hover:text-teal-700 font-medium"
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
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No lessons available yet</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#008080]" />
              <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                {tasks.length}
              </span>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#008080] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      </div>
                      {getTaskStatusBadge(task)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {task.deadline ? (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Due {formatDate(task.deadline)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>No deadline</span>
                        </div>
                      )}
                      <Link
                        to={`/task/${task.id}`}
                        className="text-[#008080] hover:text-teal-700 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
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
