import { ArrowLeft, BookOpen, CheckCircle, ExternalLink, User, Search, ChevronLeft, ChevronRight, Eye, Clock, X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TableSkeletonLoader } from '../Components/SkeletonLoader';

interface Lesson {
  id: string;
  title: string;
  description: string;
  link: string;
  orderIndex: number;
  status: string;
  createdAt: string;
  completed: boolean;
  completedAt: string | null;
  course: {
    id: string;
    name: string;
  };
  mentor: {
    id: string;
    name: string;
  };
}

const LessonsPage = () => {
  const { signOut } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMentor, setFilterMentor] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/mentee-get-lessons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }

      const result = await response.json();
      setLessons(result.data.lessons || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    try {
      setMarkingComplete(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/mentee-complete-lesson', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      });

      if (!response.ok) {
        throw new Error('Failed to mark lesson as complete');
      }

      setLessons(prev => prev.map(lesson =>
        lesson.id === lessonId ? { ...lesson, completed: true, completedAt: new Date().toISOString() } : lesson
      ));
      setSelectedLesson(null);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      alert('Failed to mark lesson as complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  const activeLessons = lessons.filter(lesson => !lesson.completed);
  const completedLessons = lessons.filter(lesson => lesson.completed);
  const lessonsToShow = showCompleted ? completedLessons : activeLessons;

  const filteredLessons = lessonsToShow.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMentor = filterMentor === 'all' || lesson.mentor.name === filterMentor;
    const matchesCourse = filterCourse === 'all' || lesson.course.name === filterCourse;

    return matchesSearch && matchesMentor && matchesCourse;
  });

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

  const uniqueMentors = [...new Set(lessons.map(lesson => lesson.mentor.name))];
  const uniqueCourses = [...new Set(lessons.map(lesson => lesson.course.name))];

  const completedCount = completedLessons.length;
  const totalCount = lessons.length;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
                <Link to="/dashboard" className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/mentors" className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  My Mentors
                </Link>
                <Link to="/profile" className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors" onClick={() => setIsMenuOpen(false)}>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-[#008080] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">All Lessons</h1>
          </div>
          <p className="text-gray-600 mb-4">
            View and complete all your assigned lessons
          </p>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {completedCount}/{totalCount} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#008080] h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% complete
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterMentor}
                onChange={(e) => {
                  setFilterMentor(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
              >
                <option value="all">All Mentors</option>
                {uniqueMentors.map(mentor => (
                  <option key={mentor} value={mentor}>{mentor}</option>
                ))}
              </select>

              <select
                value={filterCourse}
                onChange={(e) => {
                  setFilterCourse(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setShowCompleted(false);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              !showCompleted
                ? 'bg-[#008080] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active Lessons ({activeLessons.length})
          </button>
          <button
            onClick={() => {
              setShowCompleted(true);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              showCompleted
                ? 'bg-[#008080] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed Lessons ({completedLessons.length})
          </button>
        </div>

        {loading ? (
          <TableSkeletonLoader />
        ) : paginatedLessons.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedLessons.map((lesson) => (
                      <tr key={lesson.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center mr-2">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-sm text-gray-900">{lesson.mentor.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lesson.course.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lesson.completed ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedLesson(lesson)}
                            className="text-[#008080] hover:text-teal-700 cursor-pointer"
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

            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredLessons.length)}</span> of <span className="font-semibold text-gray-900">{filteredLessons.length}</span> lessons
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
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {showCompleted ? 'No completed lessons yet' : 'No active lessons found'}
            </h3>
            <p className="text-gray-500">
              {showCompleted
                ? 'Complete some lessons to see them here!'
                : filteredLessons.length === 0 && (searchTerm || filterMentor !== 'all' || filterCourse !== 'all')
                  ? 'Try adjusting your search or filters.'
                  : 'Your mentors will add lessons for you to complete. Check back later!'
              }
            </p>
          </div>
        )}
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Lesson Details</h2>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedLesson.title}</h3>
                <p className="text-gray-600 mb-4">{selectedLesson.description}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Mentor:</span>
                    <p className="text-gray-900">{selectedLesson.mentor.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Course:</span>
                    <p className="text-gray-900">{selectedLesson.course.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date Added:</span>
                    <p className="text-gray-900">{new Date(selectedLesson.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <div className="mt-1">
                      {selectedLesson.completed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <a
                href={selectedLesson.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                View Lesson
                <ExternalLink className="w-4 h-4" />
              </a>

              {!selectedLesson.completed && (
                <button
                  onClick={() => handleLessonComplete(selectedLesson.id)}
                  disabled={markingComplete}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {markingComplete ? 'Marking...' : 'Mark as Complete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsPage;
