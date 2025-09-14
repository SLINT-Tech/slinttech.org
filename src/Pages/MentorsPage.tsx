import { ArrowLeft, Eye, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockMentorsData = {
  fullName: 'John Doe',
  mentors: [
    {
      id: 'gfyffa54afvctrdt',
      fullName: 'Dr. Sarah Johnson',
      specialization: 'Full Stack Development',
      email: 'sarah.johnson@slinttech.org',
      phone: '+1 (555) 123-4567',
      courseName: 'React Fundamentals',
      duration: '8 weeks',
      lessonsCount: 3,
      tasksCount: 2,
      completedLessons: 1,
      approvedTasks: 0
    },
    {
      id: 'hgkjh67890mnbvcx',
      fullName: 'Prof. Michael Chen',
      specialization: 'Frontend Development',
      email: 'michael.chen@slinttech.org',
      phone: '+1 (555) 987-6543',
      courseName: 'Advanced CSS & Animations',
      duration: '6 weeks',
      lessonsCount: 1,
      tasksCount: 3,
      completedLessons: 0,
      approvedTasks: 2
    }
  ]
};

const MentorsPage = () => {
  const [mentorsData, setMentorsData] = useState(mockMentorsData);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {mentorsData.fullName}</span>
              <Link 
                to="/login" 
                onClick={signOut}
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
            <Users className="w-8 h-8 text-[#008080] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Mentors</h1>
          </div>
          <p className="text-gray-600">
            View your assigned mentors and access their lessons and tasks
          </p>
        </div>

        {/* Mentors Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mentorsData.mentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{mentor.fullName}</div>
                          <div className="text-sm text-gray-500">{mentor.specialization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>Lessons: {mentor.completedLessons}/{mentor.lessonsCount}</div>
                        <div>Tasks: {mentor.approvedTasks}/{mentor.tasksCount}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/mentor/${mentor.id}`)}
                        className="text-[#008080] hover:text-teal-700 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {mentorsData.mentors.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors assigned yet</h3>
            <p className="text-gray-500">
              Your mentors will appear here once they are assigned by an admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsPage;