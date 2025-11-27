import { ArrowLeft, BookOpen, Download, FileText, MessageSquare, Search, Send, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MenteeDetailSkeletonLoader } from '../Components/SkeletonLoader';
import Toast from '../Components/Toast';
import { useAuth } from '../hooks/useAuth';

interface Course {
  id: string;
  name: string;
  duration: string;
  description: string;
  status: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  approvedTasks: number;
  totalTasks: number;
  enrolledDate: string;
  completedAt: string | null;
}

interface MenteeData {
  id: string;
  fullName: string;
  email: string;
  membershipCategory: string;
  careerPath: string | null;
  status: string;
  progress: number;
  contractFileUrl: string | null;
  discordLink: string | null;
  joinedDate: string;
  lastActive: string;
  notes: string | null;
  courses: Course[];
}

const MentorMenteeDetailPage = () => {
  const { menteeId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menteeData, setMenteeData] = useState<MenteeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchMenteeDetail();
  }, [menteeId]);

  const fetchMenteeDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await fetch(`/api/mentor-get-mentee-detail?menteeId=${menteeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMenteeData(data.data);
      } else {
        setToast({ message: data.error || 'Failed to fetch mentee details', type: 'error' });
        if (response.status === 403) {
          setTimeout(() => navigate('/mentor/mentees'), 2000);
        }
      }
    } catch (error) {
      console.error('Fetch mentee detail error:', error);
      setToast({ message: 'Failed to fetch mentee details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) {
      setToast({ message: 'Please enter a message', type: 'error' });
      return;
    }

    console.log('Sending message to', menteeData?.fullName, ':', message);
    setMessage('');
    setToast({ message: 'Message sent successfully!', type: 'success' });
  };

  const downloadContract = async () => {
    if (!menteeData?.contractFileUrl) {
      setToast({ message: 'No contract file available', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/download-contract?userId=${menteeData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${menteeData.fullName.replace(/\s+/g, '_')}_contract.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setToast({ message: 'Contract downloaded successfully', type: 'success' });
      } else {
        setToast({ message: 'Failed to download contract', type: 'error' });
      }
    } catch (error) {
      console.error('Download contract error:', error);
      setToast({ message: 'Failed to download contract', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{user?.fullName}</span>
                <button
                  onClick={logout}
                  className="text-[#008080] hover:text-teal-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <MenteeDetailSkeletonLoader />
      </div>
    );
  }

  if (!menteeData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentee Not Found</h1>
          <p className="text-gray-600 mb-4">The mentee you're looking for doesn't exist.</p>
          <Link to="/mentor/mentees" className="text-[#008080] hover:text-teal-700">
            Back to Mentees
          </Link>
        </div>
      </div>
    );
  }

  const filteredCourses = menteeData.courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.fullName}</span>
              <button
                onClick={logout}
                className="text-[#008080] hover:text-teal-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/mentor/mentees')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentees
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{menteeData.fullName}</h1>
              <p className="text-gray-600">{menteeData.careerPath || 'No career path set'}</p>
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
                <p><span className="font-medium">Category:</span> {menteeData.membershipCategory}</p>
                {menteeData.discordLink && (
                  <p><span className="font-medium">Discord:</span> {menteeData.discordLink}</p>
                )}
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
              {menteeData.contractFileUrl ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">Contract.pdf</span>
                  </div>
                  <button
                    onClick={downloadContract}
                    className="text-[#008080] hover:text-teal-700"
                  >
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses ({menteeData.courses.length})</h2>
            </div>

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
                className="flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>

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
