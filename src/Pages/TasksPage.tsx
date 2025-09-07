import { AlertCircle, ArrowLeft, Clock, Send, Target, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockTasksData = {
  fullName: 'John Doe',
  tasks: [
    {
      id: 1,
      title: 'Build a Todo App with React',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      description: 'Create a fully functional todo application using React hooks. Include features like adding, editing, deleting, and marking todos as complete.',
      deadline: '2024-02-15',
      status: 'pending',
      submissionLink: '',
      submissionNotes: '',
      mentorFeedback: '',
      createdAt: '2024-01-21'
    },
    {
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
      createdAt: '2024-01-19'
    },
    {
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
      createdAt: '2024-01-16'
    },
    {
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
      createdAt: '2024-01-23'
    }
  ]
};

const TasksPage = () => {
  const [tasksData, setTasksData] = useState(mockTasksData);
  const [taskSubmissions, setTaskSubmissions] = useState({});
  const navigate = useNavigate();

  const handleTaskSubmission = (taskId) => {
    const submission = taskSubmissions[taskId];
    if (!submission?.link) return;

    setTasksData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { 
          ...task, 
          status: 'submitted',
          submissionLink: submission.link,
          submissionNotes: submission.notes || ''
        } : task
      )
    }));

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

  const approvedTasks = tasksData.tasks.filter(task => task.status === 'approved').length;
  const totalTasks = tasksData.tasks.length;

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
              <span className="text-gray-600">Welcome, {tasksData.fullName}</span>
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
            <Target className="w-8 h-8 text-[#008080] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Tasks & Assignments</h1>
          </div>
          <p className="text-gray-600 mb-4">
            Submit your assignments and track your progress
          </p>
          
          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tasks Approved</span>
              <span className="text-sm font-medium text-gray-900">
                {approvedTasks}/{totalTasks} approved
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalTasks > 0 ? (approvedTasks / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0}% approved
            </p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-6">
          {tasksData.tasks.length > 0 ? (
            tasksData.tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getTaskStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>by {task.mentor}</span>
                      </div>
                      <span>•</span>
                      <span>{task.course}</span>
                      <span>•</span>
                      <span className={`flex items-center gap-1 ${isTaskOverdue(task.deadline) ? 'text-red-600 font-medium' : ''}`}>
                        <Clock className="w-4 h-4" />
                        Due: {new Date(task.deadline).toLocaleDateString()}
                        {isTaskOverdue(task.deadline) && <AlertCircle className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Submission Form */}
                {task.status === 'pending' && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Submit Your Work</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Submission Link (Netlify/GitHub/etc.) *
                        </label>
                        <input
                          type="url"
                          value={taskSubmissions[task.id]?.link || ''}
                          onChange={(e) => updateTaskSubmission(task.id, 'link', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                          placeholder="https://your-project-link.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={taskSubmissions[task.id]?.notes || ''}
                          onChange={(e) => updateTaskSubmission(task.id, 'notes', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                          rows={3}
                          placeholder="Any additional notes about your submission..."
                        />
                      </div>
                      <button
                        onClick={() => handleTaskSubmission(task.id)}
                        disabled={!taskSubmissions[task.id]?.link}
                        className="flex items-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        Submit Task
                      </button>
                    </div>
                  </div>
                )}

                {/* Show Submission Details */}
                {task.status !== 'pending' && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Your Submission</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Link: </span>
                        <a 
                          href={task.submissionLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#008080] hover:text-teal-700 underline"
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
                  <div className={`rounded-lg p-6 ${
                    task.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <h4 className={`font-semibold mb-3 ${
                      task.status === 'approved' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      Mentor Feedback
                    </h4>
                    <p className={`${
                      task.status === 'approved' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {task.mentorFeedback}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks assigned yet</h3>
              <p className="text-gray-500">
                Your mentors will assign tasks for you to complete. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;