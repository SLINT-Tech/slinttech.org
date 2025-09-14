import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle, ExternalLink, User, Search, Filter, ChevronLeft, ChevronRight, Eye, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockLessonsData = {
  fullName: 'John Doe',
  lessons: [
    {
      id: 1,
      title: 'Introduction to React Components',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      link: 'https://example.com/lesson1',
      completed: false,
      createdAt: '2024-01-20',
      description: 'Learn the basics of React components and how to create your first functional component.'
    },
    {
      id: 2,
      title: 'State Management with useState',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      link: 'https://example.com/lesson2',
      completed: true,
      createdAt: '2024-01-18',
      description: 'Master the useState hook for managing component state in React applications.'
    },
    {
      id: 3,
      title: 'CSS Grid Layout Mastery',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      link: 'https://example.com/lesson3',
      completed: false,
      createdAt: '2024-01-22',
      description: 'Deep dive into CSS Grid and learn how to create complex layouts with ease.'
    },
    {
      id: 4,
      title: 'React Hooks Deep Dive',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      link: 'https://example.com/lesson4',
      completed: false,
      createdAt: '2024-01-25',
      description: 'Explore advanced React hooks like useEffect, useContext, and custom hooks.'
    },
    {
      id: 5,
      title: 'Advanced CSS Animations',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      link: 'https://example.com/lesson5',
      completed: true,
      createdAt: '2024-01-16',
      description: 'Create stunning animations with CSS keyframes and transitions.'
    },
    {
      id: 6,
      title: 'JavaScript ES6+ Features',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      link: 'https://example.com/lesson6',
      completed: false,
      createdAt: '2024-01-28',
      description: 'Master modern JavaScript features including arrow functions, destructuring, and async/await.'
    }
  ]
};

const LessonsPage = () => {
  const [lessonsData, setLessonsData] = useState(mockLessonsData);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMentor, setFilterMentor] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentor_id');

  const itemsPerPage = 4;

  // Get mentor name from ID for filtering
  const getMentorNameFromId = (id) => {
    const mentorMap = {
      'gfyffa54afvctrdt': 'Dr. Sarah Johnson',
      'hgkjh67890mnbvcx': 'Prof. Michael Chen'
    };
    return mentorMap[id] || null;
  };

  // Set initial filter if mentor_id is provided
  React.useEffect(() => {
    if (mentorId) {
      const mentorName = getMentorNameFromId(mentorId);
      console.log('LessonsPage - Setting filter to mentor:', mentorName);
      if (mentorName) {
        setFilterMentor(mentorName);
        setCurrentPage(1); // Reset to first page when filtering
      }
    }
  }, [mentorId]);

  const handleLessonComplete = (lessonId) => {
    setLessonsData(prev => ({
      ...prev,
      lessons: prev.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      )
    }));
  };

  // Filter lessons based on completion status
  const activeLessons = lessonsData.lessons.filter(lesson => !lesson.completed);
  const completedLessons = lessonsData.lessons.filter(lesson => lesson.completed);
  
  // Choose which lessons to display
  const lessonsToShow = showCompleted ? completedLessons : activeLessons;

  // Apply search and filters
  const filteredLessons = lessonsToShow.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMentor = filterMentor === 'all' || lesson.mentor === filterMentor;
    const matchesCourse = filterCourse === 'all' || lesson.course === filterCourse;
    
    return matchesSearch && matchesMentor && matchesCourse;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLessons = filteredLessons.slice(startIndex, startIndex + itemsPerPage);

  // Get unique mentors and courses for filters
  const uniqueMentors = [...new Set(lessonsData.lessons.map(lesson => lesson.mentor))];
  const uniqueCourses = [...new Set(lessonsData.lessons.map(lesson => lesson.course))];

  const completedCount = completedLessons.length;
  const totalCount = lessonsData.lessons.length;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {lessonsData.fullName}</span>
              <Link 
                to="/login" 
                onClick={signOut}
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-[#008080] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              {mentorId ? `Lessons from ${getMentorNameFromId(mentorId)}` : 'All Lessons'}
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            {mentorId ? `View and complete lessons from ${getMentorNameFromId(mentorId)}` : 'View and complete all your assigned lessons'}
          </p>
          
          {/* Progress Bar */}
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

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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
            
            {/* Filters */}
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

        {/* Toggle between Active and Completed */}
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

        {/* Lessons Table */}
        {paginatedLessons.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center mr-2">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-sm text-gray-900">{lesson.mentor}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lesson.course}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#008080] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
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

      {/* Lesson Details Modal */}
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
                    <p className="text-gray-900">{selectedLesson.mentor}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Course:</span>
                    <p className="text-gray-900">{selectedLesson.course}</p>
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
                  onClick={() => {
                    handleLessonComplete(selectedLesson.id);
                    setSelectedLesson(null);
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Mark as Complete
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