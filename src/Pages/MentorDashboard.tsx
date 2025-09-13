import { Calendar, CheckCircle, Clock, Eye, Plus, Target, User, Users, BookOpen, ArrowRight, Edit, Trash2, X, Send } from 'lucide-react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

// Mock data - this would come from your backend/database
const mockMentorData = {
  fullName: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@slinttech.org',
  specialization: 'Full Stack Development',
  mentees: [
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      status: 'active',
      progress: 65,
      coursesEnrolled: ['React Fundamentals'],
      completedLessons: 3,
      totalLessons: 5,
      approvedTasks: 1,
      totalTasks: 3
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'active',
      progress: 80,
      coursesEnrolled: ['React Fundamentals'],
      completedLessons: 4,
      totalLessons: 5,
      approvedTasks: 2,
      totalTasks: 3
    }
  ],
  courses: [
    {
      id: 1,
      name: 'React Fundamentals',
      duration: '8 weeks',
      description: 'Learn the basics of React development',
      enrolledMentees: 2,
      createdAt: '2024-01-15'
    }
  ],
  pendingSubmissions: [
    {
      id: 1,
      taskTitle: 'Build a Todo App with React',
      menteeName: 'John Doe',
      submittedAt: '2024-01-20',
      submissionLink: 'https://github.com/johndoe/todo-app',
      submissionNotes: 'Implemented all required features with additional styling',
      status: 'pending'
    }
  ]
};

const MentorDashboard = () => {
  const [mentorData, setMentorData] = useState(mockMentorData);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get current user status from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isPending = currentUser.status === 'pending';

  // Use current user data instead of mock data for status display
  const displayStatus = currentUser.status || 'pending';
  const displaySpecialization = currentUser.specialization || mentorData.specialization;

  const [newCourse, setNewCourse] = useState({
    name: '',
    duration: '',
    description: ''
  });

  const [newLesson, setNewLesson] = useState({
    courseId: '',
    title: '',
    description: '',
    link: ''
  });

  const [newTask, setNewTask] = useState({
    courseId: '',
    title: '',
    description: '',
    requirements: [''],
    dueDate: '',
    frequency: 'weekly'
  });

  const handleCreateCourse = () => {
    const course = {
      id: mentorData.courses.length + 1,
      ...newCourse,
      enrolledMentees: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMentorData(prev => ({
      ...prev,
      courses: [...prev.courses, course]
    }));
    setNewCourse({ name: '', duration: '', description: '' });
    setShowCreateCourseModal(false);
  };

  const handleCreateLesson = () => {
    // Here you would typically send the lesson data to your backend
    console.log('Creating lesson:', newLesson);
    setNewLesson({ courseId: '', title: '', description: '', link: '' });
    setShowCreateLessonModal(false);
    alert('Lesson created successfully!');
  };

  const handleCreateTask = () => {
    // Here you would typically send the task data to your backend
    console.log('Creating task:', newTask);
    setNewTask({
      courseId: '',
      title: '',
      description: '',
      requirements: [''],
      dueDate: '',
      frequency: 'weekly'
    });
    setShowCreateTaskModal(false);
    alert('Task created successfully!');
  };

  const addRequirement = () => {
    setNewTask(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index, value) => {
    setNewTask(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index) => {
    setNewTask(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const totalMentees = mentorData.mentees.length;
  const activeMentees = mentorData.mentees.filter(m => m.status === 'active').length;
  const totalCourses = mentorData.courses.length;
  const pendingSubmissions = mentorData.pendingSubmissions.length;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Welcome, {mentorData.fullName}</span>
              <Link 
                to="/mentor/profile" 
                className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
              >
                Profile
              </Link>
              <Link 
                to="/mentor/login" 
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
              >
                Logout
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4 absolute top-16 left-0 right-0 shadow-lg">
              <div className="flex flex-col space-y-4">
                <div className="px-4 py-2 text-gray-600 border-b border-gray-200">
                  Welcome, {mentorData.fullName}
                </div>
                <Link 
                  to="/mentor/dashboard" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/mentor/courses" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Courses
                </Link>
                <Link 
                  to="/mentor/mentees" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Mentees
                </Link>
                <Link 
                  to="/mentor/submissions" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pending Reviews
                </Link>
                <Link 
                  to="/mentor/profile" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/mentor/login" 
                  className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors border-t border-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Status Banner */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Mentor Account Under Review</h3>
                <p className="text-yellow-700 mb-3">
                  Your mentor account is currently being reviewed by our admin team. You're viewing a preview of your mentor dashboard.
                  Once approved, you'll have full access to create courses, manage mentees, and all mentor features.
                </p>
                <div className="text-sm text-yellow-600">
                  <p>✓ Mentor application submitted successfully</p>
                  <p>⏳ Admin review in progress</p>
                  <p>📧 You'll receive an email notification once approved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, {mentorData.fullName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Manage your mentees, create courses, and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#008080]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                <p className="text-2xl font-bold text-gray-900">{totalMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Mentees</p>
                <p className="text-2xl font-bold text-gray-900">{activeMentees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses Created</p>
                <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/mentor/courses"
            className={`bg-white rounded-xl shadow-sm p-6 transition-shadow text-left ${
              isPending 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:shadow-md cursor-pointer'
            }`}
            onClick={isPending ? (e) => e.preventDefault() : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-[#008080] mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View All Courses</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Manage all your courses'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link
            to="/mentor/mentees"
            className={`bg-white rounded-xl shadow-sm p-6 transition-shadow text-left ${
              isPending 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:shadow-md cursor-pointer'
            }`}
            onClick={isPending ? (e) => e.preventDefault() : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View All Mentees</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Manage your mentees'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link
            to="/mentor/submissions"
            className={`bg-white rounded-xl shadow-sm p-6 transition-shadow text-left ${
              isPending 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:shadow-md cursor-pointer'
            }`}
            onClick={isPending ? (e) => e.preventDefault() : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-yellow-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View Pending Reviews</h3>
                  <p className="text-gray-600">
                    {isPending ? 'Available after approval' : 'Review task submissions'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Courses</h2>
              {!isPending && (
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
                >
                  Create New Course
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Mentees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mentorData.courses.slice(0, 5).map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center mr-3">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          <div className="text-sm text-gray-500">{course.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.enrolledMentees} mentees
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!isPending ? (
                        <button
                          onClick={() => navigate(`/mentor/course/${course.id}`)}
                          className="text-[#008080] hover:text-teal-700 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-400">
                          <Eye className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {mentorData.courses.length > 5 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Link
                to="/mentor/courses"
                className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
              >
                View All {mentorData.courses.length} Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                <button
                  onClick={() => setShowCreateCourseModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., React Fundamentals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., 8 weeks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={4}
                  placeholder="Describe what this course covers..."
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowCreateCourseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Lesson Modal */}
      {showCreateLessonModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add New Lesson</h2>
                <button
                  onClick={() => setShowCreateLessonModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                  value={newLesson.courseId}
                  onChange={(e) => setNewLesson({...newLesson, courseId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                >
                  <option value="">Choose a course</option>
                  {mentorData.courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., Introduction to React Components"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={3}
                  placeholder="Brief description of the lesson..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Link (Codecademy URL)</label>
                <input
                  type="url"
                  value={newLesson.link}
                  onChange={(e) => setNewLesson({...newLesson, link: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="https://www.codecademy.com/..."
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowCreateLessonModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLesson}
                className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
                <button
                  onClick={() => setShowCreateTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                  value={newTask.courseId}
                  onChange={(e) => setNewTask({...newTask, courseId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                >
                  <option value="">Choose a course</option>
                  {mentorData.courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., Build a Todo App with React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={4}
                  placeholder="Detailed description of the task..."
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Requirements</label>
                  <button
                    onClick={addRequirement}
                    className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
                  >
                    + Add Requirement
                  </button>
                </div>
                {newTask.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      placeholder="Enter requirement..."
                    />
                    {newTask.requirements.length > 1 && (
                      <button
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newTask.frequency}
                    onChange={(e) => setNewTask({...newTask, frequency: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;