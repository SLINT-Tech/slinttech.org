import { ArrowLeft, BookOpen, CheckCircle, ExternalLink, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    }
  ]
};

const LessonsPage = () => {
  const [lessonsData, setLessonsData] = useState(mockLessonsData);
  const navigate = useNavigate();

  const handleLessonComplete = (lessonId) => {
    setLessonsData(prev => ({
      ...prev,
      lessons: prev.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      )
    }));
  };

  const completedLessons = lessonsData.lessons.filter(lesson => lesson.completed).length;
  const totalLessons = lessonsData.lessons.length;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900">SlintTech</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {lessonsData.fullName}</span>
              <Link 
                to="/login" 
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
            <h1 className="text-3xl font-bold text-gray-900">Current Lessons</h1>
          </div>
          <p className="text-gray-600 mb-4">
            Complete your assigned lessons and track your progress
          </p>
          
          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {completedLessons}/{totalLessons} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#008080] h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}% complete
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-6">
          {lessonsData.lessons.length > 0 ? (
            lessonsData.lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">{lesson.title}</h3>
                      {lesson.completed && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>by {lesson.mentor}</span>
                      </div>
                      <span>•</span>
                      <span>{lesson.course}</span>
                      <span>•</span>
                      <span>Added {new Date(lesson.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <a
                        href={lesson.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                      >
                        View Lesson
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      
                      {!lesson.completed && (
                        <button
                          onClick={() => handleLessonComplete(lesson.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons available yet</h3>
              <p className="text-gray-500">
                Your mentors will add lessons for you to complete. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;