import { ArrowLeft, BookOpen, CheckCircle, Clock, Target, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MentorCoursesTableSkeletonLoader } from '../Components/SkeletonLoader';
import Navigation from '../Components/Navigation';

interface CourseStats {
  totalLessons: number;
  completedLessons: number;
  totalTasks: number;
  approvedTasks: number;
  pendingTasks: number;
  submittedTasks: number;
}

interface Course {
  courseId: string;
  courseName: string;
  courseDescription: string;
  duration: string;
  enrollmentStatus: string;
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
  stats: CourseStats;
}

interface MentorInfo {
  id: string;
  fullName: string;
  email: string;
  specialization: string | null;
  assignedDate: string;
}

const MenteeMentorCoursesPage = () => {
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentorId');
  const { signOut } = useAuth();
  const [mentor, setMentor] = useState<MentorInfo | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const coursesPerPage = 10;
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
    if (mentorId) {
      fetchMentorCourses();
    }
  }, [mentorId]);

  const fetchMentorCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/mentee-get-mentor-courses?mentorId=${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to fetch courses');
      }

      const result = await response.json();
      setMentor(result.data.mentor);
      setCourses(result.data.courses || []);
    } catch (error: any) {
      console.error('Error fetching mentor courses:', error);
      navigate('/mentors');
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

  const totalCourses = courses.length;
  const totalPages = Math.ceil(totalCourses / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const paginatedCourses = courses.slice(startIndex, endIndex);

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
          to="/mentors"
          className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentors
        </Link>

        {loading ? (
          <MentorCoursesTableSkeletonLoader />
        ) : (
          <>
            {mentor && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <User className="w-8 h-8 text-[#008080] dark:text-teal-400 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">{mentor.fullName}</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-2 transition-colors">{mentor.specialization || 'Mentor'}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg transition-colors">
                        <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 transition-colors">{mentor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg transition-colors">
                        <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 transition-colors">Assigned {formatDate(mentor.assignedDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {courses.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#008080] dark:text-teal-400 transition-colors" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Enrolled Courses</h2>
                  <span className="bg-[#008080] dark:bg-teal-600 text-white px-2 py-1 rounded-full text-xs font-medium transition-colors">
                    {courses.length}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900 transition-colors">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Lessons
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Tasks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                        {paginatedCourses.map((course) => (
                          <tr key={course.courseId} onClick={() => navigate(`/mentor-course-detail?mentorId=${mentorId}&courseId=${course.courseId}`)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 transition-colors">
                                {course.courseName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 transition-colors">
                                {course.courseDescription}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors">
                                  <div
                                    className="bg-[#008080] dark:bg-teal-600 h-2 rounded-full transition-all"
                                    style={{ width: `${course.progressPercentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                                  {course.progressPercentage}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 transition-colors" />
                                <span className="text-sm text-gray-900 dark:text-white transition-colors">
                                  {course.stats.completedLessons}/{course.stats.totalLessons}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-orange-500 dark:text-orange-400 transition-colors" />
                                <span className="text-sm text-gray-900 dark:text-white transition-colors">
                                  {course.stats.approvedTasks}/{course.stats.totalTasks}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                <Clock className="w-4 h-4" />
                                {course.duration}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                              <Link
                                to={`/mentor-course-detail?mentorId=${mentorId}&courseId=${course.courseId}`}
                                className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                              >
                                View Details →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mt-4 border border-gray-200 dark:border-gray-700 transition-colors">
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
                  Your mentor has not enrolled you in any courses yet.
                </p>
                <Link
                  to="/mentors"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#008080] dark:bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Mentors
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MenteeMentorCoursesPage;
