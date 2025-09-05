import { Calendar, Clock, ExternalLink, MessageSquare, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockMenteeData = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  membershipCategory: 'Student',
  careerPath: 'Full Stack Development',
  status: 'pending', // 'pending' or 'approved'
  assignedMentor: null, // Will be null until admin assigns
  discordLink: null, // Will be null until admin sets
  courses: [], // Will be empty until admin sets
  announcements: [
    {
      id: 1,
      title: 'Welcome to SlintTech!',
      message: 'Thank you for joining our community. Your application is being reviewed.',
      date: '2024-01-15',
      type: 'info'
    }
  ]
};

const MenteeDashboard = () => {
  const [menteeData] = useState(mockMenteeData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600">
            Track your progress and connect with your mentor
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Membership Status</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(menteeData.status)}`}>
                {getStatusText(menteeData.status)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Career Path</p>
              <p className="font-medium text-gray-900">{menteeData.careerPath}</p>
            </div>
          </div>
          
          {menteeData.status === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Your membership is under review.</strong> You will receive an email update once approved.
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Assigned Mentor */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Assigned Mentor</h2>
              </div>
              
              {menteeData.assignedMentor ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#008080] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{menteeData.assignedMentor.name}</h3>
                    <p className="text-gray-600">{menteeData.assignedMentor.email}</p>
                    <p className="text-sm text-gray-500">{menteeData.assignedMentor.expertise}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No mentor assigned yet</p>
                  <p className="text-sm text-gray-400">
                    A mentor will be assigned once your membership is approved
                  </p>
                </div>
              )}
            </div>

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
                    className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-4 py-2 rounded-lg hover:bg-[#4752C4] transition-colors"
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
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Course List & Timelines */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-[#008080] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Course Timeline</h2>
              </div>
              
              {menteeData.courses.length > 0 ? (
                <div className="space-y-4">
                  {menteeData.courses.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        {course.link && (
                          <a
                            href={course.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 inline-flex items-center gap-1 text-[#008080] hover:text-teal-700 text-sm font-medium"
                          >
                            Start Course
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No courses assigned yet</p>
                  <p className="text-sm text-gray-400">
                    Course timeline will be available once your membership is approved
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
                  {menteeData.announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-[#008080] bg-gray-50 p-4 rounded-r-lg">
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