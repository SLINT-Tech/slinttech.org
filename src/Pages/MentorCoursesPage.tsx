import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Eye, Loader2, Plus, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';
import Navigation from '../Components/Navigation';

interface Course {
  id: string;
  name: string;
  duration: string;
  description: string;
  status: string;
  enrolledMentees: number;
  createdAt: string;
}

interface Stats {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
}

const MentorCoursesPage = () => {
  const { user, signOut } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, activeCourses: 0, totalEnrollments: 0 });
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    durationNumber: '',
    durationUnit: 'weeks',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setPageLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await fetch('/api/mentor-get-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourses(data.data.courses);
        setStats(data.data.stats);
      } else {
        setToast({ message: data.error || 'Failed to fetch courses', type: 'error' });
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      setToast({ message: 'Failed to fetch courses', type: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.name.trim()) {
      setToast({ message: 'Please enter a course name', type: 'error' });
      return;
    }

    if (!newCourse.durationNumber || parseInt(newCourse.durationNumber) <= 0) {
      setToast({ message: 'Please enter a valid duration', type: 'error' });
      return;
    }

    if (!newCourse.description.trim()) {
      setToast({ message: 'Please enter a course description', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Please log in again', type: 'error' });
        navigate('/mentor/login');
        return;
      }

      const duration = `${newCourse.durationNumber} ${newCourse.durationUnit}`;

      const response = await fetch('/api/mentor-create-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCourse.name.trim(),
          duration,
          description: newCourse.description.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Course created successfully!', type: 'success' });
        setNewCourse({ name: '', durationNumber: '', durationUnit: 'weeks', description: '' });
        setShowCreateCourseModal(false);
        fetchCourses();
      } else {
        setToast({ message: data.error || 'Failed to create course', type: 'error' });
      }
    } catch (error) {
      console.error('Create course error:', error);
      setToast({ message: 'Failed to create course. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
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
        setCourses(prev => prev.map(course =>
          course.id === courseId ? { ...course, status: newStatus } : course
        ));
        setToast({ message: 'Course status updated successfully!', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to update course status', type: 'error' });
      }
    } catch (error) {
      console.error('Update status error:', error);
      setToast({ message: 'Failed to update course status', type: 'error' });
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      {/* Header */}
      <Navigation
        role="Mentor"
        userName={currentUser.fullName || user?.fullName || 'Mentor'}
        onLogout={() => {
          signOut();
          navigate('/mentor/login');
        }}
      />

      {pageLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-6 animate-pulse transition-colors"></div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-3 transition-colors"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse transition-colors"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse transition-colors"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse transition-colors"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse transition-colors"></div>
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse transition-colors"></div>
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse transition-colors"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 overflow-hidden mb-8 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse transition-colors"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 transition-colors">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mr-3 transition-colors"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse transition-colors"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56 animate-pulse transition-colors"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse transition-colors"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse transition-colors"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse transition-colors"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse transition-colors"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 animate-pulse transition-colors"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse transition-colors"></div>
              <div className="flex items-center gap-2">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse transition-colors"></div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse transition-colors"></div>
                  ))}
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse transition-colors"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/mentor/dashboard')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-3 transition-colors" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">All Courses</h1>
            </div>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="bg-[#008080] dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Course
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Manage all your courses, view enrolled mentees, and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-[#008080] dark:text-teal-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.totalEnrollments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.activeCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Avg. Enrollment</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                  {stats.totalCourses > 0 ? Math.round(stats.totalEnrollments / stats.totalCourses) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {courses.length > 0 ? (
          <>
            {/* Courses Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 overflow-hidden mb-8 transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Enrolled Mentees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                    {courses
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((course) => (
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
                            {course.enrolledMentees} {course.enrolledMentees === 1 ? 'mentee' : 'mentees'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={course.status}
                              onChange={(e) => handleStatusChange(course.id, e.target.value)}
                              className={`text-xs font-semibold rounded-full px-3 py-1 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 transition-colors ${
                                course.status === 'active'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
                                  : course.status === 'archived'
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="archived">Archived</option>
                              <option value="ended">Ended</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/mentor/course/${course.id}`)}
                              className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {courses.length > itemsPerPage && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    Showing <span className="font-medium text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.min(currentPage * itemsPerPage, courses.length)}
                    </span>{' '}
                    of <span className="font-medium text-gray-900 dark:text-white">{courses.length}</span> courses
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(courses.length / itemsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          const totalPages = Math.ceil(courses.length / itemsPerPage);
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center gap-1">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-gray-500 dark:text-gray-400 transition-colors">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                currentPage === page
                                  ? 'bg-[#008080] dark:bg-teal-600 text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent dark:border-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(courses.length / itemsPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(courses.length / itemsPerPage)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-12 text-center transition-colors">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">No courses created yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors">
              Create your first course to start teaching and managing mentees.
            </p>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="bg-[#008080] dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer"
            >
              Create Your First Course
            </button>
          </div>
        )}
      </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl dark:shadow-gray-950/50 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Create New Course</h2>
                <button
                  onClick={() => setShowCreateCourseModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Course Name</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="e.g., React Fundamentals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Duration</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newCourse.durationNumber}
                    onChange={(e) => setNewCourse({...newCourse, durationNumber: e.target.value})}
                    className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                    placeholder="e.g., 8"
                  />
                  <select
                    value={newCourse.durationUnit}
                    onChange={(e) => setNewCourse({...newCourse, durationUnit: e.target.value})}
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  rows={4}
                  placeholder="Describe what this course covers..."
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3 flex-shrink-0 transition-colors">
              <button
                onClick={() => setShowCreateCourseModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={loading}
                className="px-4 py-2 bg-[#008080] dark:bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
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

export default MentorCoursesPage;