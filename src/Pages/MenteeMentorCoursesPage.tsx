import { ArrowLeft, BookOpen, CheckCircle, Clock, Target, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TableSkeletonLoader } from '../Components/SkeletonLoader';
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
  }, []);

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
    <div className="min-h-screen bg-[#F8F8F8]">
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
          className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentors
        </Link>

        {loading ? (
          <TableSkeletonLoader />
        ) : (
          <>
            {mentor && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-200">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-[#008080]" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{mentor.fullName}</h1>
                    <p className="text-gray-600 text-base md:text-lg mb-2">{mentor.specialization || 'Mentor'}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <span className="text-xs md:text-sm text-gray-700">{mentor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <span className="text-xs md:text-sm text-gray-700">Assigned {formatDate(mentor.assignedDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {courses.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#008080]" />
                  <h2 className="text-xl font-bold text-gray-900">Enrolled Courses</h2>
                  <span className="bg-[#008080] text-white px-2 py-1 rounded-full text-xs font-medium">
                    {courses.length}
                  </span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lessons
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tasks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedCourses.map((course) => (
                          <tr key={course.courseId} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {course.courseName}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {course.courseDescription}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#008080] h-2 rounded-full transition-all"
                                    style={{ width: `${course.progressPercentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {course.progressPercentage}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-900">
                                  {course.stats.completedLessons}/{course.stats.totalLessons}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-gray-900">
                                  {course.stats.approvedTasks}/{course.stats.totalTasks}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                {course.duration}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/mentor-course-detail?mentorId=${mentorId}&courseId=${course.courseId}`}
                                className="text-[#008080] hover:text-teal-700 font-medium transition-colors"
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
                  <div className="bg-white rounded-xl shadow-sm p-6 mt-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(endIndex, totalCourses)}</span> of <span className="font-semibold text-gray-900">{totalCourses}</span> courses
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
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
                                    ? 'bg-[#008080] text-white shadow-md'
                                    : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
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
                          className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Courses Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Your mentor has not enrolled you in any courses yet.
                </p>
                <Link
                  to="/mentors"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors"
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
