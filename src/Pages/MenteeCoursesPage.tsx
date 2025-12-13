import { ArrowLeft, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CourseCardSkeletonLoader } from '../Components/SkeletonLoader';
import Navigation from '../Components/Navigation';

interface ActiveCourse {
  courseId: string;
  courseName: string;
  courseDescription: string;
  duration: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  mentorSpecialization: string | null;
  enrollmentStatus: string;
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
  lessonsCount: number;
  tasksCount: number;
  completedLessons: number;
  approvedTasks: number;
}

const MenteeCoursesPage = () => {
  const { signOut } = useAuth();
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.status === 'pending') {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/mentee-get-mentors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Error fetching courses');
        return;
      }

      const result = await response.json();
      setActiveCourses(result.data.activeCourses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const totalCourses = activeCourses.length;
  const totalPages = Math.ceil(totalCourses / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const paginatedCourses = activeCourses.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
            My Courses
          </h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Track your learning progress across all enrolled courses
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <CourseCardSkeletonLoader key={index} />
            ))}
          </div>
        ) : activeCourses.length > 0 ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#008080] dark:text-teal-400 transition-colors" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Active Courses</h3>
                <span className="bg-[#008080] dark:bg-teal-600 text-white px-2 py-1 rounded-full text-xs font-medium transition-colors">
                  {activeCourses.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors">
                        {course.courseName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors">
                        by {course.mentorName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 transition-colors">Progress</span>
                      <span className="font-medium text-[#008080] dark:text-teal-400 transition-colors">
                        {course.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors">
                      <div
                        className="bg-[#008080] dark:bg-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 transition-colors">
                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors">Lessons</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                          {course.completedLessons}/{course.lessonsCount}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 transition-colors">
                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors">Tasks</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                          {course.approvedTasks}/{course.tasksCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 transition-colors">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                    <Link
                      to={`/mentor-course-detail?mentorId=${course.mentorId}&courseId=${course.courseId}`}
                      className="text-sm text-[#008080] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    Showing <span className="font-semibold text-gray-900 dark:text-white transition-colors">{startIndex + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white transition-colors">{Math.min(endIndex, totalCourses)}</span> of <span className="font-semibold text-gray-900 dark:text-white transition-colors">{totalCourses}</span> courses
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
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
                                ? 'bg-[#008080] dark:bg-teal-600 text-white shadow-md dark:shadow-gray-900/50'
                                : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
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
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
              No Courses Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
              You haven't enrolled in any courses yet. Check out your assigned mentors to get started.
            </p>
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#008080] dark:bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors"
            >
              View Mentors
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeCoursesPage;
