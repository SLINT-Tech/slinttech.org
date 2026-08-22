import { ArrowLeft, BookOpen, Loader2, MessageSquare, Search, Send, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MenteeDetailSkeletonLoader } from '../Components/SkeletonLoader';
import Toast from '../Components/Toast';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';
import { apiGet, apiPost, ApiError } from '../lib/api';

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
  communityLink: string | null;
  joinedDate: string;
  lastActive: string;
  notes: string | null;
  courses: Course[];
}

const MentorMenteeDetailPage = () => {
  const { menteeId } = useParams();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [menteeData, setMenteeData] = useState<MenteeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; status?: string } | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.status === 'pending') {
      navigate('/mentor/dashboard');
      return;
    }
    fetchMenteeDetail();
  }, [menteeId, navigate]);

  const fetchMenteeDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const data = await apiGet('/mentor/mentees/detail', { menteeId });
      setMenteeData(data);
    } catch (error) {
      console.error('Fetch mentee detail error:', error);
      const apiError = error as ApiError;
      setToast({ message: apiError.message || 'Failed to fetch mentee details', type: 'error' });
      if (apiError.status === 403) {
        setTimeout(() => navigate('/mentor/mentees'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      setToast({ message: 'Please enter a message', type: 'error' });
      return;
    }

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      await apiPost('/mentor/messages/send', {
        menteeId: menteeId,
        message: message.trim()
      });

      setMessage('');
      setToast({ message: 'Message sent successfully!', type: 'success' });
    } catch (error) {
      console.error('Send message error:', error);
      setToast({ message: error instanceof Error ? error.message : 'Failed to send message', type: 'error' });
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950">
        <Navigation
          role="Mentor"
          userName={currentUser?.fullName || 'Mentor'}
          onLogout={() => {
            signOut();
            navigate('/login');
          }}
        />
        <MenteeDetailSkeletonLoader backLink={{ to: '/mentor/mentees', label: 'Back to Mentees' }} />
      </div>
    );
  }

  if (!menteeData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mentee Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The mentee you're looking for doesn't exist.</p>
          <Link to="/mentor/mentees" className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
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
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navigation
        role="Mentor"
        userName={currentUser?.fullName || 'Mentor'}
        onLogout={() => {
          signOut();
          navigate('/login');
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/mentor/mentees')}
          className="flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mentees
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{menteeData.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-400">{menteeData.careerPath || 'No career path set'}</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(menteeData.status)} mt-2`}>
                {menteeData.status.charAt(0).toUpperCase() + menteeData.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium dark:text-gray-300">Email:</span> {menteeData.email}</p>
                <p><span className="font-medium dark:text-gray-300">Category:</span> {menteeData.membershipCategory}</p>
                {menteeData.communityLink && (
                  <p><span className="font-medium dark:text-gray-300">Slack:</span> {menteeData.communityLink}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Progress Overview</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium dark:text-gray-300">Overall Progress:</span> {menteeData.progress}%</p>
                <p><span className="font-medium dark:text-gray-300">Joined:</span> {new Date(menteeData.joinedDate).toLocaleDateString()}</p>
                <p><span className="font-medium dark:text-gray-300">Last Active:</span> {new Date(menteeData.lastActive).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Enrolled Courses ({menteeData.courses.length})</h2>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:border-[#008080] dark:focus:border-teal-600 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-600/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{course.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{course.duration}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                              <div
                                className="bg-[#008080] dark:bg-teal-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{course.progress}%</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No courses found matching your search.' : 'No courses enrolled yet'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center mb-6">
              <MessageSquare className="w-6 h-6 text-[#008080] dark:text-teal-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Message</h2>
            </div>

            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-600 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-600/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={6}
                placeholder="Type your message here..."
              />
              <button
                onClick={sendMessage}
                disabled={sendingMessage}
                className="flex items-center gap-2 bg-[#008080] dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-[#008080] dark:text-teal-400">{menteeData.courses.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{menteeData.progress}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
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
