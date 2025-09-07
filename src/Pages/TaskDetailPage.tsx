import { AlertCircle, ArrowLeft, Clock, Send, Target, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Mock data - this would come from your backend/database based on task ID
const getTaskData = (taskId) => {
  const mockTasks = {
    '1': {
      id: 1,
      title: 'Build a Todo App with React',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      description: 'Create a fully functional todo application using React hooks. Include features like adding, editing, deleting, and marking todos as complete. The application should have a clean, modern interface and be responsive across different screen sizes.',
      deadline: '2024-02-15',
      status: 'pending',
      submissionLink: '',
      submissionNotes: '',
      mentorFeedback: '',
      createdAt: '2024-01-21',
      requirements: [
        'Use React functional components and hooks',
        'Implement CRUD operations for todos',
        'Add local storage persistence',
        'Make it responsive for mobile and desktop',
        'Include proper error handling'
      ]
    },
    '2': {
      id: 2,
      title: 'Responsive Portfolio Website',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      description: 'Design and build a responsive portfolio website with CSS animations. Showcase your projects and skills with smooth transitions and mobile-first design.',
      deadline: '2024-02-20',
      status: 'approved',
      submissionLink: 'https://netlify.app/my-portfolio',
      submissionNotes: 'Added extra animations and mobile-first approach',
      mentorFeedback: 'Excellent work! Great attention to detail and smooth animations. The mobile responsiveness is perfect.',
      createdAt: '2024-01-19',
      requirements: [
        'Mobile-first responsive design',
        'CSS animations and transitions',
        'Portfolio showcase section',
        'Contact form functionality',
        'Cross-browser compatibility'
      ]
    },
    '4': {
      id: 4,
      title: 'CSS Animation Showcase',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      description: 'Create a showcase page demonstrating various CSS animations and transitions. Include keyframe animations, hover effects, and scroll-triggered animations.',
      deadline: '2024-02-25',
      status: 'submitted',
      submissionLink: 'https://codepen.io/johndoe/pen/animation-showcase',
      submissionNotes: 'Created 8 different animation examples with smooth transitions',
      mentorFeedback: '',
      createdAt: '2024-01-23',
      requirements: [
        'Create at least 6 different animation types',
        'Use CSS keyframes for complex animations',
        'Implement hover and focus effects',
        'Add scroll-triggered animations',
        'Ensure smooth performance across browsers'
      ]
    },
    '5': {
      id: 5,
      title: 'JavaScript Calculator',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      description: 'Build a functional calculator using vanilla JavaScript with proper error handling and keyboard support.',
      deadline: '2024-02-28',
      status: 'submitted',
      submissionLink: 'https://github.com/johndoe/js-calculator',
      submissionNotes: 'Implemented all basic operations with keyboard support and error handling for division by zero',
      mentorFeedback: '',
      createdAt: '2024-01-24',
      requirements: [
        'Basic arithmetic operations (+, -, *, /)',
        'Keyboard input support',
        'Error handling for invalid operations',
        'Clear and reset functionality',
        'Responsive design for mobile devices'
      ]
    },
    '6': {
      id: 6,
      title: 'Landing Page Design',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      description: 'Create a modern landing page with smooth scrolling, parallax effects, and responsive design.',
      deadline: '2024-03-05',
      status: 'approved',
      submissionLink: 'https://netlify.app/landing-page',
      submissionNotes: 'Implemented all requested features with additional micro-interactions',
      mentorFeedback: 'Outstanding work! The parallax effects are smooth and the design is very professional.',
      createdAt: '2024-01-26',
      requirements: [
        'Modern, clean design aesthetic',
        'Smooth scrolling navigation',
        'Parallax scrolling effects',
        'Fully responsive across all devices',
        'Fast loading performance'
      ]
    },
    '3': {
      id: 3,
      title: 'API Integration Exercise',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      description: 'Integrate a REST API into your React application. Handle loading states, error handling, and display data in a user-friendly format.',
      deadline: '2024-02-10',
      status: 'rejected',
      submissionLink: 'https://github.com/johndoe/api-project',
      submissionNotes: 'Implemented with fetch API and error handling',
      mentorFeedback: 'Good attempt, but error handling needs improvement. Please add loading states and better user feedback. Resubmit after addressing these issues.',
      createdAt: '2024-01-16',
      requirements: [
        'Fetch data from a public API',
        'Implement loading states',
        'Handle error scenarios gracefully',
        'Display data in a clean format',
        'Add search/filter functionality'
      ]
    }
  };

  return mockTasks[taskId] || null;
};

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const taskData = getTaskData(taskId);
  const navigate = useNavigate();
  
  const [submissionData, setSubmissionData] = useState({
    link: taskData?.submissionLink || '',
    notes: taskData?.submissionNotes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!taskData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
          <Link to="/tasks" className="text-[#008080] hover:text-teal-700 cursor-pointer">
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmission = async () => {
    if (!submissionData.link.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically send the data to your backend
    console.log('Task submission:', { taskId, ...submissionData });
    
    setIsSubmitting(false);
    alert('Task submitted successfully!');
    navigate('/tasks');
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
              <span className="text-gray-600">Task Details</span>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>

        {/* Task Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-[#008080]" />
                <h1 className="text-2xl font-bold text-gray-900">{taskData.title}</h1>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getTaskStatusColor(taskData.status)}`}>
                  {taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1)}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Mentor: {taskData.mentor}</span>
                </div>
                <div>
                  <span>Course: {taskData.course}</span>
                </div>
                <div className={`flex items-center gap-2 ${isTaskOverdue(taskData.deadline) ? 'text-red-600 font-medium' : ''}`}>
                  <Clock className="w-4 h-4" />
                  <span>Due: {new Date(taskData.deadline).toLocaleDateString()}</span>
                  {isTaskOverdue(taskData.deadline) && <AlertCircle className="w-4 h-4" />}
                </div>
                <div>
                  <span>Assigned: {new Date(taskData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Task Details */}
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Description</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{taskData.description}</p>
              
              {taskData.requirements && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Requirements:</h3>
                  <ul className="space-y-2">
                    {taskData.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <div className="w-1.5 h-1.5 bg-[#008080] rounded-full mt-2 flex-shrink-0"></div>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Mentor Feedback */}
            {taskData.mentorFeedback && (
              <div className={`rounded-xl shadow-sm p-6 ${
                taskData.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h2 className={`text-xl font-semibold mb-4 ${
                  taskData.status === 'approved' ? 'text-green-900' : 'text-red-900'
                }`}>
                  Mentor Feedback
                </h2>
                <p className={`leading-relaxed ${
                  taskData.status === 'approved' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {taskData.mentorFeedback}
                </p>
              </div>
            )}
          </div>

          {/* Submission Section */}
          <div className="space-y-6">
            {/* Current Submission */}
            {taskData.status !== 'pending' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Submission Link:</span>
                    <div className="mt-1">
                      <a 
                        href={taskData.submissionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#008080] hover:text-teal-700 underline break-all cursor-pointer"
                      >
                        {taskData.submissionLink}
                      </a>
                    </div>
                  </div>
                  {taskData.submissionNotes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-600 mt-1">{taskData.submissionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submission Form */}
            {(taskData.status === 'pending' || taskData.status === 'rejected') && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {taskData.status === 'rejected' ? 'Resubmit Your Work' : 'Submit Your Work'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Link (Netlify/GitHub/etc.) *
                    </label>
                    <input
                      type="url"
                      value={submissionData.link}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      placeholder="https://your-project-link.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={submissionData.notes}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      rows={4}
                      placeholder="Any additional notes about your submission..."
                    />
                  </div>
                  <button
                    onClick={handleSubmission}
                    disabled={!submissionData.link.trim() || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {taskData.status === 'rejected' ? 'Resubmit Task' : 'Submit Task'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;