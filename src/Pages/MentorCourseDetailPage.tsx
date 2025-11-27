import { ArrowLeft, BookOpen, Eye, Loader2, Plus, Target, Trash2, User, Users, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';

interface Course {
  id: string;
  name: string;
  duration: string;
  description: string;
  status: string;
  enrolledMentees: number;
  createdAt: string;
  lessons: Lesson[];
  tasks: Task[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  frequency: string;
  requirements: string[];
  createdAt: string;
}

const MentorCourseDetailPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [courseStatus, setCourseStatus] = useState('active');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setPageLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await fetch(`/api/mentor-get-course-detail?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourse(data.data);
        setCourseStatus(data.data.status);
      } else {
        setToast({ message: data.error || 'Failed to fetch course details', type: 'error' });
        if (response.status === 404) {
          setTimeout(() => navigate('/mentor/courses'), 2000);
        }
      }
    } catch (error) {
      console.error('Fetch course details error:', error);
      setToast({ message: 'Failed to fetch course details', type: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Please log in again', type: 'error' });
        navigate('/mentor/login');
        return;
      }

      const response = await fetch('/api/mentor-update-course-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourseStatus(newStatus);
        if (course) {
          setCourse({ ...course, status: newStatus });
        }
        setToast({ message: 'Course status updated successfully!', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to update course status', type: 'error' });
      }
    } catch (error) {
      console.error('Update status error:', error);
      setToast({ message: 'Failed to update course status', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ended':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mr-4"></div>
              <div className="flex-1 space-y-2">
                <div className="h-7 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/mentor/courses" className="text-[#008080] hover:text-teal-700 cursor-pointer">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Course: {course.name}</span>
              <Link
                to="/mentor/login"
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/mentor/courses')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>
            <div className="ml-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Course Status</label>
              <select
                value={courseStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`text-sm font-semibold rounded-full px-4 py-2 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008080]/20 ${getStatusColor(courseStatus)}`}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Duration:</span> {course.duration}</p>
                <p><span className="font-medium">Created:</span> {new Date(course.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> {courseStatus.charAt(0).toUpperCase() + courseStatus.slice(1)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Content</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Enrolled Mentees:</span> {course.enrolledMentees}</p>
                <p><span className="font-medium">Lessons:</span> {course.lessons.length}</p>
                <p><span className="font-medium">Tasks:</span> {course.tasks.length}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium text-left cursor-pointer"
                >
                  + Add Lesson
                </button>
                <button
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium text-left cursor-pointer"
                >
                  + Create Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lessons ({course.lessons.length})</h3>
            </div>

            {course.lessons.length > 0 ? (
              <div className="space-y-3">
                {course.lessons.map((lesson) => (
                  <div key={lesson.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                        <a
                          href={lesson.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008080] hover:text-teal-700 text-sm mt-2 inline-flex items-center gap-1 cursor-pointer"
                        >
                          View Lesson
                          <Eye className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(lesson.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No lessons created yet</p>
                <p className="text-sm text-gray-400">Add lessons to help your mentees learn</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tasks ({course.tasks.length})</h3>
            </div>

            {course.tasks.length > 0 ? (
              <div className="space-y-3">
                {course.tasks.map((task) => (
                  <div key={task.id} className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          <span>Frequency: {task.frequency}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        {task.requirements && task.requirements.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Requirements:</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {task.requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks created yet</p>
                <p className="text-sm text-gray-400">Create tasks to challenge your mentees</p>
              </div>
            )}
          </div>
        </div>
      </div>

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

export default MentorCourseDetailPage;
