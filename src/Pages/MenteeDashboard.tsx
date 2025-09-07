import { Calendar, CheckCircle, Clock, ExternalLink, FileText, MessageSquare, Send, User, Users, AlertCircle, BookOpen, Target } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockMenteeData = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  membershipCategory: 'Student',
  careerPath: 'Full Stack Development',
  status: 'approved', // 'pending' or 'approved'
  mentorAssignments: [
    {
      mentor: 'Dr. Sarah Johnson - Full Stack Development',
      courseName: 'React Fundamentals',
      duration: '8 weeks',
      mentorEmail: 'sarah.johnson@slinttech.org',
      mentorPhone: '+1 (555) 123-4567'
    },
    {
      mentor: 'Prof. Michael Chen - Frontend Development',
      courseName: 'Advanced CSS & Animations',
      duration: '6 weeks',
      mentorEmail: 'michael.chen@slinttech.org',
      mentorPhone: '+1 (555) 987-6543'
    }
  ],
  discordLink: null, // Will be null until admin sets
  lessons: [
    {
      id: 1,
      title: 'Introduction to React Components',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      link: 'https://example.com/lesson1',
      completed: false,
      createdAt: '2024-01-20'
    },
    {
      id: 2,
      title: 'State Management with useState',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      link: 'https://example.com/lesson2',
      completed: true,
      createdAt: '2024-01-18'
    },
    {
      id: 3,
      title: 'CSS Grid Layout Mastery',
      mentor: 'Prof. Michael Chen',
      course: 'Advanced CSS & Animations',
      link: 'https://example.com/lesson3',
      completed: false,
      createdAt: '2024-01-22'
    }
  ],
  tasks: [
    {
      id: 1,
      title: 'Build a Todo App with React',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      description: 'Create a fully functional todo application using React hooks',
      deadline: '2024-02-15',
      status: 'pending', // 'pending', 'submitted', 'approved', 'rejected'
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
      description: 'Design and build a responsive portfolio website with CSS animations',
      deadline: '2024-02-20',
      status: 'approved',
      submissionLink: 'https://netlify.app/my-portfolio',
      submissionNotes: 'Added extra animations and mobile-first approach',
      mentorFeedback: 'Excellent work! Great attention to detail and smooth animations.',
      createdAt: '2024-01-19'
    },
    {
      id: 3,
      title: 'API Integration Exercise',
      mentor: 'Dr. Sarah Johnson',
      course: 'React Fundamentals',
      description: 'Integrate a REST API into your React application',
      deadline: '2024-02-10',
      status: 'rejected',
      submissionLink: 'https://github.com/johndoe/api-project',
      submissionNotes: 'Implemented with fetch API and error handling',
      mentorFeedback: 'Good attempt, but error handling needs improvement. Please add loading states and better user feedback.',
      createdAt: '2024-01-16'
    }
  ],
  announcements: [
    {
      id: 1,
      title: 'New Lesson Available',
      message: 'Dr. Sarah Johnson has added a new lesson: "Introduction to React Components"',
      date: '2024-01-15',
      type: 'info'
    },
    {
      id: 2,
      title: 'Task Deadline Reminder',
      message: 'Your "Build a Todo App with React" task is due in 3 days.',
      date: '2024-01-12',
      type: 'warning'
    }
  ]
};

const MenteeDashboard = () => {
  const [menteeData, setMenteeData] = useState(mockMenteeData);
  const [taskSubmissions, setTaskSubmissions] = useState({});

  const handleLessonComplete = (lessonId) => {
    setMenteeData(prev => ({
      ...prev,
      lessons: prev.lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      )
    }));
  };

  const handleTaskSubmission = (taskId) => {
    const submission = taskSubmissions[taskId];
    if (!submission?.link) return;

    setMenteeData(prev => ({
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

  const completedLessons = menteeData.lessons.filter(lesson => lesson.completed).length;
  const totalLessons = menteeData.lessons.length;
  const approvedTasks = menteeData.tasks.filter(task => task.status === 'approved').length;
  const totalTasks = menteeData.tasks.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Active';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Unknown';
    }
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
              <span className="text-gray-600">Welcome, {menteeData.fullName}</span>
              <Link 
                to="/login" 
                className="text-[#008080] hover:text-teal-700 font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, {menteeData.fullName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Track your progress, complete lessons, and submit tasks
          </p>
        </div>

        {/* Overview Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Overview</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Progress Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Lessons Progress</h3>
              <div className="flex items-center mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {completedLessons}/{totalLessons}
                </span>
              </div>
              <p className="text-xs text-gray-500">Lessons completed</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tasks Progress</h3>
              <div className="flex items-center mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalTasks > 0 ? (approvedTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {approvedTasks}/{totalTasks}
                </span>
              </div>
              <p className="text-xs text-gray-500">Tasks approved</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(menteeData.status)}`}>
                {getStatusText(menteeData.status)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{menteeData.careerPath}</p>
            </div>
          </div>
          
          {/* Mentor Contact Info */}
          {menteeData.mentorAssignments.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mentors</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {menteeData.mentorAssignments.map((assignment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{assignment.mentor.split(' - ')[0]}</h4>
                        <p className="text-sm text-gray-600">{assignment.courseName}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📧 {assignment.mentorEmail}</p>
                      <p>📞 {assignment.mentorPhone}</p>
                      <p>⏱️ Duration: {assignment.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Lessons Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Current Lessons</h2>
              </div>
              
              {menteeData.lessons.length > 0 ? (
                <div className="space-y-4">
                  {menteeData.lessons.map((lesson) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-gray-900 mr-2">{lesson.title}</h3>
                            {lesson.completed && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">by {lesson.mentor}</p>
                          <p className="text-xs text-gray-500 mb-3">{lesson.course}</p>
                          <div className="flex items-center gap-3">
                            <a
                              href={lesson.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#008080] hover:text-teal-700 text-sm font-medium"
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
                  <p className="text-sm text-gray-400">
                    Your mentors will add lessons for you to complete
                  </p>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Tasks & Assignments</h2>
              </div>
              
              {menteeData.tasks.length > 0 ? (
                <div className="space-y-6">
                  {menteeData.tasks.map((task) => (
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
                            <span>by {task.mentor}</span>
                            <span>•</span>
                            <span>{task.course}</span>
                            <span>•</span>
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
                  <p className="text-sm text-gray-400">
                    Your mentors will assign tasks for you to complete
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Community Discord */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Community Discord</h2>
              </div>
              
              {menteeData.discordLink ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Join our Discord community to connect with other members and mentors.
                  </p>
                  <a
                    href={menteeData.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-4 py-2 rounded-lg hover:bg-[#4752C4] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Join Discord Server
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Discord invite not available yet</p>
                  <p className="text-sm text-gray-400">
                    You'll receive a Discord invite once your membership is approved
                  </p>
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
              </div>
              
              {menteeData.announcements.length > 0 ? (
                <div className="space-y-4">
                  <div className="py-4">
                    {menteeData.announcements.map((announcement) => (
                      <div key={announcement.id} className={`border-l-4 p-4 rounded-r-lg mb-3 ${
                        announcement.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-[#008080] bg-gray-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                            <p className="text-gray-600 mb-2">{announcement.message}</p>
                            <p className="text-xs text-gray-500">{announcement.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No announcements yet</p>
                  <p className="text-sm text-gray-400">
                    Check back later for updates and announcements
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeDashboard;