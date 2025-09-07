import { ArrowLeft, BookOpen, CheckCircle, Clock, ExternalLink, MessageSquare, Send, Target, User, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Mock data - this would come from your backend/database based on mentor name
const getMentorData = (mentorId) => {
  const mockData = {
    'gfyffa54afvctrdt': {
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
    'hgkjh67890mnbvcx': {
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

  return mockData[mentorId] || null;
};

const MentorDetailPage = () => {
  const { mentorId } = useParams();
  const mentorData = getMentorData(mentorId);
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
            <Link 
              to={`/lessons?mentor_id=${mentorId}`}
              className="inline-flex items-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
            >
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
          {/* Quick Access Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <BookOpen className="w-6 h-6 text-[#008080] mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Current Lessons</h2>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
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
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                View and complete lessons from {mentorData.fullName}
              </p>
              <Link 
                to="/lessons" 
                className="inline-flex items-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                <BookOpen className="w-5 h-5" />
                View All Lessons
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 text-[#008080] mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Tasks & Assignments</h2>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Submit assignments and track your progress with {mentorData.fullName}
              </p>
              <Link 
                to={`/tasks?mentor_id=${mentorId}`}
                className="inline-flex items-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                <Target className="w-5 h-5" />
                View All Tasks
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;