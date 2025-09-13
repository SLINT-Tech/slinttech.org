import { ArrowLeft, BookOpen, CheckCircle, Clock, Eye, MessageSquare, Plus, Target, User, Users, X, Send, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Mock data - this would come from your backend/database based on course ID
const getCourseData = (courseId) => {
  const mockData = {
    '1': {
      id: 1,
      name: 'React Fundamentals',
      duration: '8 weeks',
      description: 'Learn the basics of React development',
      enrolledMentees: 2,
      createdAt: '2024-01-15',
      mentorName: 'Dr. Sarah Johnson',
      mentees: [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          status: 'active',
          progress: 65,
          completedLessons: 3,
          totalLessons: 5,
          approvedTasks: 1,
          totalTasks: 3,
          joinedDate: '2024-01-15',
          lastActive: '2024-01-25'
        },
        {
          id: 2,
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          status: 'active',
          progress: 80,
          completedLessons: 4,
          totalLessons: 5,
          approvedTasks: 2,
          totalTasks: 3,
          joinedDate: '2024-01-10',
          lastActive: '2024-01-24'
        }
      ],
      lessons: [
        {
          id: 1,
          title: 'Introduction to React Components',
          description: 'Learn the basics of React components and how to create your first functional component.',
          link: 'https://www.codecademy.com/learn/react-101',
          createdAt: '2024-01-20'
        },
        {
          id: 2,
          title: 'State Management with useState',
          description: 'Master the useState hook for managing component state in React applications.',
          link: 'https://www.codecademy.com/learn/react-hooks',
          createdAt: '2024-01-18'
        },
        {
          id: 4,
          title: 'React Hooks Deep Dive',
          description: 'Explore advanced React hooks like useEffect, useContext, and custom hooks.',
          link: 'https://www.codecademy.com/learn/advanced-react',
          createdAt: '2024-01-25'
        }
      ],
      tasks: [
        {
          id: 1,
          title: 'Build a Todo App with React',
          description: 'Create a fully functional todo application using React hooks. Include features like adding, editing, deleting, and marking todos as complete.',
          deadline: '2024-02-15',
          status: 'active',
          frequency: 'weekly',
          requirements: [
            'Use React functional components and hooks',
            'Implement CRUD operations for todos',
            'Add local storage persistence',
            'Make it responsive for mobile and desktop'
          ],
          createdAt: '2024-01-21'
        },
        {
          id: 3,
          title: 'API Integration Exercise',
          description: 'Integrate a REST API into your React application. Handle loading states, error handling, and display data in a user-friendly format.',
          deadline: '2024-02-10',
          status: 'active',
          frequency: 'monthly',
          requirements: [
            'Fetch data from a public API',
            'Implement loading states',
            'Handle error scenarios gracefully',
            'Display data in a clean format'
          ],
          createdAt: '2024-01-16'
        }
      ]
    },
    '2': {
      id: 2,
      name: 'Advanced JavaScript',
      duration: '6 weeks',
      description: 'Master advanced JavaScript concepts',
      enrolledMentees: 1,
      createdAt: '2024-01-20',
      mentorName: 'Dr. Sarah Johnson',
      mentees: [
        {
          id: 3,
          fullName: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          status: 'inactive',
          progress: 30,
          completedLessons: 1,
          totalLessons: 4,
          approvedTasks: 0,
          totalTasks: 2,
          joinedDate: '2024-01-20',
          lastActive: '2024-01-22'
        }
      ],
      lessons: [
        {
          id: 3,
          title: 'ES6+ Features Deep Dive',
          description: 'Master modern JavaScript features including arrow functions, destructuring, and async/await.',
          link: 'https://www.codecademy.com/learn/javascript-es6',
          createdAt: '2024-01-22'
        }
      ],
      tasks: [
        {
          id: 4,
          title: 'JavaScript Calculator',
          description: 'Build a functional calculator using vanilla JavaScript with proper error handling and keyboard support.',
          deadline: '2024-02-28',
          status: 'active',
          frequency: 'weekly',
          requirements: [
            'Basic arithmetic operations (+, -, *, /)',
            'Keyboard input support',
            'Error handling for invalid operations',
            'Clear and reset functionality'
          ],
          createdAt: '2024-01-24'
        }
      ]
    }
  };

  return mockData[courseId] || null;
};

// Available mentees that can be added to course
const availableMentees = [
  {
    id: 4,
    fullName: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    status: 'active'
  },
  {
    id: 5,
    fullName: 'David Brown',
    email: 'david.brown@example.com',
    status: 'active'
  }
];

const MentorCourseDetailPage = () => {
  const { courseId } = useParams();
  const courseData = getCourseData(courseId);
  const navigate = useNavigate();
  
  const [showAddMenteeModal, setShowAddMenteeModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    link: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    requirements: [''],
    dueDate: '',
    frequency: 'weekly'
  });

  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/mentor/dashboard" className="text-[#008080] hover:text-teal-700 cursor-pointer">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleAddMentees = () => {
    if (selectedMentees.length === 0) return;
    
    // Here you would typically send the data to your backend
    console.log('Adding mentees to course:', { courseId, menteeIds: selectedMentees });
    
    setShowAddMenteeModal(false);
    setSelectedMentees([]);
    alert(`${selectedMentees.length} mentee(s) added to course successfully!`);
  };

  const handleRemoveMentee = (menteeId) => {
    if (confirm('Are you sure you want to remove this mentee from the course?')) {
      console.log('Removing mentee from course:', { courseId, menteeId });
      alert('Mentee removed from course successfully!');
    }
  };

  const handleCreateLesson = () => {
    if (!newLesson.title || !newLesson.link) return;
    
    console.log('Creating lesson:', { courseId, ...newLesson });
    setNewLesson({ title: '', description: '', link: '' });
    setShowCreateLessonModal(false);
    alert('Lesson created successfully!');
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description) return;
    
    console.log('Creating task:', { courseId, ...newTask });
    setNewTask({
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter mentees based on search term
  const filteredMentees = courseData.mentees.filter(mentee =>
    mentee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Course: {courseData.name}</span>
              <Link 
                to="/mentor/login" 
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
          onClick={() => navigate('/mentor/dashboard')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Course Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{courseData.name}</h1>
              <p className="text-gray-600">{courseData.description}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Duration:</span> {courseData.duration}</p>
                <p><span className="font-medium">Created:</span> {new Date(courseData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Enrollment</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Enrolled Mentees:</span> {courseData.mentees.length}</p>
                <p><span className="font-medium">Lessons:</span> {courseData.lessons.length}</p>
                <p><span className="font-medium">Tasks:</span> {courseData.tasks.length}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowAddMenteeModal(true)}
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium text-left cursor-pointer"
                >
                  + Add Mentees
                </button>
                <button
                  onClick={() => setShowCreateLessonModal(true)}
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium text-left cursor-pointer"
                >
                  + Create Lesson
                </button>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium text-left cursor-pointer"
                >
                  + Create Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enrolled Mentees */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Enrolled Mentees</h2>
              <button
                onClick={() => setShowAddMenteeModal(true)}
                className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
              >
                Add Mentees
              </button>
            </div>
            
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Mentees Table */}
            {filteredMentees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMentees.map((mentee) => (
                      <tr key={mentee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{mentee.fullName}</div>
                              <div className="text-sm text-gray-500">{mentee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(mentee.status)}`}>
                            {mentee.status.charAt(0).toUpperCase() + mentee.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${mentee.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{mentee.progress}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Lessons: {mentee.completedLessons}/{mentee.totalLessons} | Tasks: {mentee.approvedTasks}/{mentee.totalTasks}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(mentee.joinedDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/mentor/mentee/${mentee.id}`)}
                              className="text-[#008080] hover:text-teal-700 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveMentee(mentee.id)}
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? 'No mentees found matching your search.' : 'No mentees enrolled yet'}
                </p>
                <p className="text-sm text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Add mentees to get started'}
                </p>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="space-y-6">
            {/* Lessons */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Lessons ({courseData.lessons.length})</h3>
                <button
                  onClick={() => setShowCreateLessonModal(true)}
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer"
                >
                  Add Lesson
                </button>
              </div>
              
              {courseData.lessons.length > 0 ? (
                <div className="space-y-3">
                  {courseData.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          <a 
                            href={lesson.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#008080] hover:text-teal-700 text-sm mt-2 inline-flex items-center gap-1 cursor-pointer"
                          >
                            View Lesson
                            <Eye className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No lessons created yet</p>
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tasks ({courseData.tasks.length})</h3>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer"
                >
                  Create Task
                </button>
              </div>
              
              {courseData.tasks.length > 0 ? (
                <div className="space-y-3">
                  {courseData.tasks.map((task) => (
                    <div key={task.id} className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                            <span>Frequency: {task.frequency}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tasks created yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Mentees Modal */}
      {showAddMenteeModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add Mentees to Course</h2>
                <button
                  onClick={() => setShowAddMenteeModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-gray-600 mb-4">Select mentees to add to "{courseData.name}":</p>
              
              <div className="space-y-3">
                {availableMentees.map((mentee) => (
                  <div key={mentee.id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      id={`mentee-${mentee.id}`}
                      checked={selectedMentees.includes(mentee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMentees([...selectedMentees, mentee.id]);
                        } else {
                          setSelectedMentees(selectedMentees.filter(id => id !== mentee.id));
                        }
                      }}
                      className="mr-3"
                    />
                    <label htmlFor={`mentee-${mentee.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-900">{mentee.fullName}</div>
                      <div className="text-sm text-gray-500">{mentee.email}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowAddMenteeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMentees}
                disabled={selectedMentees.length === 0}
                className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add {selectedMentees.length} Mentee(s)
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
                <h2 className="text-2xl font-bold text-gray-900">Create New Lesson</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson URL</label>
                <input
                  type="url"
                  value={newLesson.link}
                  onChange={(e) => setNewLesson({...newLesson, link: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="https://example.com/lesson-url"
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
                Create Lesson
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

export default MentorCourseDetailPage;