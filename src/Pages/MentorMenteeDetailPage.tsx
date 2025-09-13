import { ArrowLeft, BookOpen, CheckCircle, Clock, Download, FileText, MessageSquare, Search, Send, Target, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Mock data - this would come from your backend/database based on mentee ID
const getMenteeData = (menteeId) => {
  const mockData = {
    '1': {
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      membershipCategory: 'Student',
      careerPath: 'Full Stack Development',
      status: 'active',
      progress: 65,
      joinedDate: '2024-01-15',
      lastActive: '2024-01-25',
      phone: '+1 (555) 123-4567',
      contractFile: 'john_doe_contract.pdf',
      courses: [
        {
          id: 1,
          name: 'React Fundamentals',
          mentor: 'Dr. Sarah Johnson',
          duration: '8 weeks',
          progress: 75,
          completedLessons: 3,
          totalLessons: 4,
          approvedTasks: 2,
          totalTasks: 3,
          enrolledDate: '2024-01-15',
          status: 'active'
        },
        {
          id: 2,
          name: 'Advanced JavaScript',
          mentor: 'Dr. Sarah Johnson',
          duration: '6 weeks',
          progress: 50,
          completedLessons: 2,
          totalLessons: 4,
          approvedTasks: 1,
          totalTasks: 2,
          enrolledDate: '2024-01-20',
          status: 'active'
        }
      ]
    },
    '2': {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      membershipCategory: 'Professional',
      careerPath: 'Frontend Development',
      status: 'active',
      progress: 80,
      joinedDate: '2024-01-10',
      lastActive: '2024-01-24',
      phone: '+1 (555) 987-6543',
      contractFile: 'jane_smith_contract.pdf',
      courses: [
        {
          id: 1,
          name: 'React Fundamentals',
          mentor: 'Dr. Sarah Johnson',
          duration: '8 weeks',
          progress: 90,
          completedLessons: 4,
          totalLessons: 4,
          approvedTasks: 3,
          totalTasks: 3,
          enrolledDate: '2024-01-10',
          status: 'completed'
        }
      ]
    },
    '3': {
      id: 3,
      fullName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      membershipCategory: 'Student',
      careerPath: 'Backend Development',
      status: 'inactive',
      progress: 30,
      joinedDate: '2024-01-20',
      lastActive: '2024-01-22',
      phone: '+1 (555) 456-7890',
      contractFile: 'mike_johnson_contract.pdf',
      courses: [
        {
          id: 3,
          name: 'Node.js Backend',
          mentor: 'Dr. Sarah Johnson',
          duration: '10 weeks',
          progress: 30,
          completedLessons: 1,
          totalLessons: 5,
          approvedTasks: 0,
          totalTasks: 2,
          enrolledDate: '2024-01-20',
          status: 'active'
        }
      ]
    }
  };

  return mockData[menteeId] || null;
};

const MentorMenteeDetailPage = () => {
  const { menteeId } = useParams();
  const menteeData = getMenteeData(menteeId);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!menteeData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentee Not Found</h1>
          <p className="text-gray-600 mb-4">The mentee you're looking for doesn't exist.</p>
          <Link to="/mentor/mentees" className="text-[#008080] hover:text-teal-700 cursor-pointer">
            Back to Mentees
          </Link>
        </div>
      </div>
    );
  }

  const sendMessage = () => {
    if (!message.trim()) return;
    
    console.log('Sending message to', menteeData.fullName, ':', message);
    setMessage('');
    alert('Message sent successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter courses based on search term
  const filteredCourses = menteeData.courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.mentor.toLowerCase().includes(searchTerm.toLowerCase())
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
              <span className="text-gray-600">Mentee: {menteeData.fullName}</span>
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
          onClick={() => navigate('/mentor/mentees')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentees
        </button>

        {/* Mentee Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{menteeData.fullName}</h1>
              <p className="text-gray-600">{menteeData.careerPath}</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(menteeData.status)} mt-2`}>
                {menteeData.status.charAt(0).toUpperCase() + menteeData.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Email:</span> {menteeData.email}</p>
                <p><span className="font-medium">Phone:</span> {menteeData.phone}</p>
                <p><span className="font-medium">Category:</span> {menteeData.membershipCategory}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Progress Overview</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Overall Progress:</span> {menteeData.progress}%</p>
                <p><span className="font-medium">Joined:</span> {new Date(menteeData.joinedDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Last Active:</span> {new Date(menteeData.lastActive).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contract Document</h3>
              {menteeData.contractFile ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{menteeData.contractFile}</span>
                  </div>
                  <button className="text-[#008080] hover:text-teal-700 cursor-pointer">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No contract uploaded</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enrolled Courses */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses ({menteeData.courses.length})</h2>
            </div>
            
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Courses Table */}
            {filteredCourses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                            <div className="text-sm text-gray-500">{course.duration}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Lessons: {course.completedLessons}/{course.totalLessons} | Tasks: {course.approvedTasks}/{course.totalTasks}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(course.status)}`}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchTerm ? 'No courses found matching your search.' : 'No courses enrolled yet'}
                </p>
              </div>
            )}
          </div>

          {/* Send Message */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <MessageSquare className="w-6 h-6 text-[#008080] mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                rows={6}
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

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#008080]">{menteeData.courses.length}</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">{menteeData.progress}%</div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorMenteeDetailPage;