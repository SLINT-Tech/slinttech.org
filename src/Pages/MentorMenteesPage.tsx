import { ArrowLeft, BookOpen, CheckCircle, Clock, Eye, MessageSquare, Target, User, Users, X, Plus, Send } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockMentorData = {
  fullName: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@slinttech.org',
  specialization: 'Full Stack Development',
  courses: [
    {
      id: 1,
      name: 'React Fundamentals',
      duration: '8 weeks',
      description: 'Learn the basics of React development',
      enrolledMentees: 2,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Advanced JavaScript',
      duration: '6 weeks',
      description: 'Master advanced JavaScript concepts',
      enrolledMentees: 1,
      createdAt: '2024-01-20'
    }
  ],
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
      coursesEnrolled: ['React Fundamentals'],
      completedLessons: 4,
      totalLessons: 5,
      approvedTasks: 2,
      totalTasks: 3,
      joinedDate: '2024-01-10',
      lastActive: '2024-01-24'
    },
    {
      id: 3,
      fullName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      status: 'inactive',
      progress: 30,
      coursesEnrolled: ['Advanced JavaScript'],
      completedLessons: 1,
      totalLessons: 4,
      approvedTasks: 0,
      totalTasks: 2,
      joinedDate: '2024-01-20',
      lastActive: '2024-01-22'
    }
  ]
};

const MentorMenteesPage = () => {
  const [mentorData, setMentorData] = useState(mockMentorData);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showMenteeModal, setShowMenteeModal] = useState(false);
  const [showAddToCourseModal, setShowAddToCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleViewMentee = (mentee) => {
    setSelectedMentee(mentee);
    setShowMenteeModal(true);
  };

  const handleAddToCourse = () => {
    if (!selectedCourse || !selectedMentee) return;
    
    // Update mentee's enrolled courses
    setMentorData(prev => ({
      ...prev,
      mentees: prev.mentees.map(mentee => 
        mentee.id === selectedMentee.id 
          ? { 
              ...mentee, 
              coursesEnrolled: [...mentee.coursesEnrolled, prev.courses.find(c => c.id === parseInt(selectedCourse))?.name]
            }
          : mentee
      )
    }));
    
    setShowAddToCourseModal(false);
    setSelectedCourse('');
    alert('Mentee added to course successfully!');
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    // Here you would typically send the message via your backend
    console.log('Sending message to', selectedMentee.fullName, ':', message);
    setMessage('');
    alert('Message sent successfully!');
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

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900">SlintTech Mentor</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {mentorData.fullName}</span>
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

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-[#008080] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Mentees</h1>
          </div>
          <p className="text-gray-600">
            Manage your mentees, track their progress, and assign them to courses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#008080]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                <p className="text-2xl font-bold text-gray-900">{mentorData.mentees.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Mentees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mentorData.mentees.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses Created</p>
                <p className="text-2xl font-bold text-gray-900">{mentorData.courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(mentorData.mentees.reduce((acc, m) => acc + m.progress, 0) / mentorData.mentees.length)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mentees Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mentorData.mentees.map((mentee) => (
                  <tr key={mentee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{mentee.fullName}</div>
                          <div className="text-sm text-gray-500">{mentee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(mentee.status)}`}>
                        {mentee.status.charAt(0).toUpperCase() + mentee.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${mentee.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{mentee.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentee.coursesEnrolled.length} course(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(mentee.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewMentee(mentee)}
                          className="text-[#008080] hover:text-teal-700 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMentee(mentee);
                            setShowAddToCourseModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mentee Details Modal */}
      {showMenteeModal && selectedMentee && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Mentee Details</h2>
                <button
                  onClick={() => setShowMenteeModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Full Name</span>
                    <p className="text-gray-900">{selectedMentee.fullName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-gray-900">{selectedMentee.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedMentee.status)}`}>
                      {selectedMentee.status.charAt(0).toUpperCase() + selectedMentee.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Joined Date</span>
                    <p className="text-gray-900">{new Date(selectedMentee.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Overall Progress</span>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedMentee.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{selectedMentee.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Lessons Progress</span>
                    <p className="text-gray-900">{selectedMentee.completedLessons}/{selectedMentee.totalLessons} completed</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tasks Progress</span>
                    <p className="text-gray-900">{selectedMentee.approvedTasks}/{selectedMentee.totalTasks} approved</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Enrolled Courses</span>
                    <p className="text-gray-900">{selectedMentee.coursesEnrolled.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Send Message */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
                <div className="space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    rows={4}
                    placeholder="Type your message here..."
                  />
                  <button
                    onClick={sendMessage}
                    className="flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Course Modal */}
      {showAddToCourseModal && selectedMentee && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Add to Course</h2>
                <button
                  onClick={() => setShowAddToCourseModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Add <strong>{selectedMentee.fullName}</strong> to a course:
                </p>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                >
                  <option value="">Select a course</option>
                  {mentorData.courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddToCourseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCourse}
                  disabled={!selectedCourse}
                  className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Add to Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMenteesPage;