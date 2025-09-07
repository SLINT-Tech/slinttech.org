import { ArrowLeft, BookOpen, CheckCircle, Clock, ExternalLink, MessageSquare, Send, Target, User, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Mock data - this would come from your backend/database based on mentor name
const getMentorData = (mentorName) => {
  const mockData = {
    'Dr. Sarah Johnson': {
      fullName: 'Dr. Sarah Johnson',
      specialization: 'Full Stack Development',
      email: 'sarah.johnson@slinttech.org',
      phone: '+1 (555) 123-4567',
      courseName: 'React Fundamentals',
      duration: '8 weeks',
      lessons: [
        {
          id: 1,
          title: 'Introduction to React Components',
          link: 'https://example.com/lesson1',
          completed: false,
          createdAt: '2024-01-20',
          description: 'Learn the basics of React components and how to create your first functional component.'
        },
        {
          id: 2,
          title: 'State Management with useState',
          link: 'https://example.com/lesson2',
          completed: true,
          createdAt: '2024-01-18',
          description: 'Master the useState hook for managing component state in React applications.'
        },
        {
          id: 4,
          title: 'React Hooks Deep Dive',
          link: 'https://example.com/lesson4',
          completed: false,
          createdAt: '2024-01-25',
          description: 'Explore advanced React hooks like useEffect, useContext, and custom hooks.'
        }
      ],
      tasks: [
        {
          id: 1,
          title: 'Build a Todo App with React',
          description: 'Create a fully functional todo application using React hooks. Include features like adding, editing, deleting, and marking todos as complete.',
          deadline: '2024-02-15',
          status: 'pending',
          submissionLink: '',
          submissionNotes: '',
          mentorFeedback: '',
          createdAt: '2024-01-21'
        },
        {
          id: 3,
          title: 'API Integration Exercise',
          description: 'Integrate a REST API into your React application. Handle loading states, error handling, and display data in a user-friendly format.',
          deadline: '2024-02-10',
          status: 'rejected',
          submissionLink: 'https://github.com/johndoe/api-project',
          submissionNotes: 'Implemented with fetch API and error handling',
          mentorFeedback: 'Good attempt, but error handling needs improvement. Please add loading states and better user feedback. Resubmit after addressing these issues.',
          createdAt: '2024-01-16'
        }
      ]
    },
    'Prof. Michael Chen': {
      fullName: 'Prof. Michael Chen',
      specialization: 'Frontend Development',
      email: 'michael.chen@slinttech.org',
      phone: '+1 (555) 987-6543',
      courseName: 'Advanced CSS & Animations',
      duration: '6 weeks',
      lessons: [
        {
          id: 3,
          title: 'CSS Grid Layout Mastery',
          link: 'https://example.com/lesson3',
          completed: false,
          createdAt: '2024-01-22',
          description: 'Deep dive into CSS Grid and learn how to create complex layouts with ease.'
        }
      ],
      tasks: [
        {
          id: 2,
          title: 'Responsive Portfolio Website',
          description: 'Design and build a responsive portfolio website with CSS animations. Showcase your projects and skills with smooth transitions and mobile-first design.',
          deadline: '2024-02-20',
          status: 'approved',
          submissionLink: 'https://netlify.app/my-portfolio',
          submissionNotes: 'Added extra animations and mobile-first approach',
          mentorFeedback: 'Excellent work! Great attention to detail and smooth animations. The mobile responsiveness is perfect.',
          createdAt: '2024-01-19'
        },
        {
          id: 4,
          title: 'CSS Animation Showcase',
          description: 'Create a showcase page demonstrating various CSS animations and transitions. Include keyframe animations, hover effects, and scroll-triggered animations.',
          deadline: '2024-02-25',
          status: 'submitted',
          submissionLink: 'https://codepen.io/johndoe/pen/animation-showcase',
          submissionNotes: 'Created 8 different animation examples with smooth transitions',
          mentorFeedback: '',
          createdAt: '2024-01-23'
        }
      ]
    }
  };

  return mockData[mentorName] || null;
};

const MentorDetailPage = () => {
  const { mentorName } = useParams();
  const decodedMentorName = decodeURIComponent(mentorName || '');
  const mentorData = getMentorData(decodedMentorName);
  const navigate = useNavigate();
  
  const [taskSubmissions, setTaskSubmissions] = useState({});
  const [lessons, setLessons] = useState(mentorData?.lessons || []);
  const [tasks, setTasks] = useState(mentorData?.tasks || []);

  if (!mentorData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentor Not Found</h1>
          <p className="text-gray-600 mb-4">The mentor you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="text-[#008080] hover:text-teal-700 cursor-pointer">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleLessonComplete = (lessonId) => {
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      )
    );
  };

  const handleTaskSubmission = (taskId) => {
    const submission = taskSubmissions[taskId];
    if (!submission?.link) return;

    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          status: 'submitted',
          submissionLink: submission.link,
          submissionNotes: submission.notes || ''
        } : task
      )
    );

    // Clear the form
    setTaskSubmissions(prev => ({
      ...prev,
      [taskId]: { link: '', notes: '' }
    }));
  };

  const updateTaskSubmission = (taskId, field, value) => {
    setTaskSubmissions(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isTaskOverdue = (deadline) => {
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const totalLessons = lessons.length;

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
              <span className="text-gray-600">Mentor: {mentorData.fullName}</span>
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

        {/* Mentor Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mentorData.fullName}</h1>
              <p className="text-gray-600">{mentorData.specialization}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 {mentorData.email}</p>
                <p>📞 {mentorData.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Course:</span> {mentorData.courseName}</p>
                <p><span className="font-medium">Duration:</span> {mentorData.duration}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Lessons Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <BookOpen className="w-6 h-6 text-[#008080] mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Current Lessons</h2>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {completedLessons}/{totalLessons}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {lessons.length > 0 ? (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-gray-900 mr-2">{lesson.title}</h3>
                          {lesson.completed && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                        <div className="flex items-center gap-3">
                          <a
                            href={lesson.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
                          >
                            View Lesson
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {!lesson.completed && (
                            <button
                              onClick={() => handleLessonComplete(lesson.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No lessons available yet</p>
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 text-[#008080] mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Tasks & Assignments</h2>
            </div>
            
            {tasks.length > 0 ? (
              <div className="space-y-6">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTaskStatusColor(task.status)}`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className={`flex items-center gap-1 ${isTaskOverdue(task.deadline) ? 'text-red-600 font-medium' : ''}`}>
                            <Clock className="w-3 h-3" />
                            Due: {new Date(task.deadline).toLocaleDateString()}
                            {isTaskOverdue(task.deadline) && <AlertCircle className="w-3 h-3" />}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Task Submission Form */}
                    {task.status === 'pending' && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <h4 className="font-medium text-gray-900 mb-3">Submit Your Work</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Submission Link (Netlify/GitHub/etc.) *
                            </label>
                            <input
                              type="url"
                              value={taskSubmissions[task.id]?.link || ''}
                              onChange={(e) => updateTaskSubmission(task.id, 'link', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm"
                              placeholder="https://your-project-link.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes (Optional)
                            </label>
                            <textarea
                              value={taskSubmissions[task.id]?.notes || ''}
                              onChange={(e) => updateTaskSubmission(task.id, 'notes', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm"
                              rows={2}
                              placeholder="Any additional notes about your submission..."
                            />
                          </div>
                          <button
                            onClick={() => handleTaskSubmission(task.id)}
                            disabled={!taskSubmissions[task.id]?.link}
                            className="flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                            Submit Task
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show Submission Details */}
                    {task.status !== 'pending' && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <h4 className="font-medium text-gray-900 mb-2">Your Submission</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Link: </span>
                            <a 
                              href={task.submissionLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#008080] hover:text-teal-700 underline cursor-pointer"
                            >
                              {task.submissionLink}
                            </a>
                          </div>
                          {task.submissionNotes && (
                            <div>
                              <span className="font-medium text-gray-700">Notes: </span>
                              <span className="text-gray-600">{task.submissionNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mentor Feedback */}
                    {task.mentorFeedback && (
                      <div className={`rounded-lg p-4 ${
                        task.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          task.status === 'approved' ? 'text-green-900' : 'text-red-900'
                        }`}>
                          Mentor Feedback
                        </h4>
                        <p className={`text-sm ${
                          task.status === 'approved' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {task.mentorFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;