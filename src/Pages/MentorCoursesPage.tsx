import { ArrowLeft, BookOpen, Eye, Plus, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';

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
    },
    {
      id: 3,
      name: 'Node.js Backend Development',
      duration: '10 weeks',
      description: 'Build scalable backend applications with Node.js',
      enrolledMentees: 3,
      createdAt: '2024-01-12'
    },
    {
      id: 4,
      name: 'Database Design & SQL',
      duration: '4 weeks',
      description: 'Learn database design principles and SQL',
      enrolledMentees: 2,
      createdAt: '2024-01-25'
    },
    {
      id: 5,
      name: 'API Development with Express',
      duration: '6 weeks',
      description: 'Create RESTful APIs using Express.js',
      enrolledMentees: 1,
      createdAt: '2024-01-18'
    }
  ]
};

const MentorCoursesPage = () => {
  const { user } = useAuth();
  const [mentorData, setMentorData] = useState(mockMentorData);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    durationNumber: '',
    durationUnit: 'weeks',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleCreateCourse = async () => {
    if (!newCourse.name.trim()) {
      setToast({ message: 'Please enter a course name', type: 'error' });
      return;
    }

    if (!newCourse.durationNumber || parseInt(newCourse.durationNumber) <= 0) {
      setToast({ message: 'Please enter a valid duration', type: 'error' });
      return;
    }

    if (!newCourse.description.trim()) {
      setToast({ message: 'Please enter a course description', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Please log in again', type: 'error' });
        navigate('/mentor/login');
        return;
      }

      const duration = `${newCourse.durationNumber} ${newCourse.durationUnit}`;

      const response = await fetch('/.netlify/functions/mentor-create-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCourse.name.trim(),
          duration,
          description: newCourse.description.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Course created successfully!', type: 'success' });
        setNewCourse({ name: '', durationNumber: '', durationUnit: 'weeks', description: '' });
        setShowCreateCourseModal(false);
      } else {
        setToast({ message: data.error || 'Failed to create course', type: 'error' });
      }
    } catch (error) {
      console.error('Create course error:', error);
      setToast({ message: 'Failed to create course. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
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
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-[#008080] mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
            </div>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Course
            </button>
          </div>
          <p className="text-gray-600">
            Manage all your courses, view enrolled mentees, and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-[#008080]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{mentorData.courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mentorData.courses.reduce((acc, course) => acc + course.enrolledMentees, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{mentorData.courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Enrollment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(mentorData.courses.reduce((acc, course) => acc + course.enrolledMentees, 0) / mentorData.courses.length)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                {mentorData.courses.map((course) => (
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
                      <button
                        onClick={() => navigate(`/mentor/course/${course.id}`)}
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
        {mentorData.courses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses created yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first course to start teaching and managing mentees.
            </p>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
            >
              Create Your First Course
            </button>
          </div>
        )}
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
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newCourse.durationNumber}
                    onChange={(e) => setNewCourse({...newCourse, durationNumber: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    placeholder="e.g., 8"
                  />
                  <select
                    value={newCourse.durationUnit}
                    onChange={(e) => setNewCourse({...newCourse, durationUnit: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none bg-white"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
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
                disabled={loading}
                className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MentorCoursesPage;