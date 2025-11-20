import { ArrowLeft, BookOpen, CheckCircle, Clock, Eye, MessageSquare, Target, User, Users, X, Plus, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { MentorMenteeRelationship, UserProfile } from '../hooks/useAuth';

const MentorMenteesPage = () => {
  const [mentorData, setMentorData] = useState(null);
  const [menteeRelationships, setMenteeRelationships] = useState<MentorMenteeRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showMenteeModal, setShowMenteeModal] = useState(false);
  const [showAddToCourseModal, setShowAddToCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/mentor/login');
          return;
        }

        // Fetch mentor profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || profile.role !== 'Mentor') {
          navigate('/mentor/login');
          return;
        }

        setMentorData({
          fullName: profile.full_name,
          email: user.email,
          specialization: profile.specialization || profile.career_path,
          courses: [] // Mock courses for now
        });

        // Fetch mentor-mentee relationships with mentee details
        const { data: relationships, error: relationshipsError } = await supabase
          .from('mentor_mentee_relationships')
          .select(`
            *,
            mentee:user_profiles!mentee_id(
              id,
              full_name,
              email,
              created_at
            )
          `)
          .eq('mentor_id', user.id)
          .order('created_at', { ascending: false });

        if (relationshipsError) {
          console.error('Error fetching relationships:', relationshipsError);
        } else {
          setMenteeRelationships(relationships || []);
        }

      } catch (error) {
        console.error('Error fetching mentor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [navigate]);

  const handleViewMentee = (mentee) => {
    setSelectedMentee(mentee);
    setShowMenteeModal(true);
  };

  const handleAddToCourse = () => {
    if (!selectedCourse || !selectedMentee) return;
    
    // Here you would update the relationship in the database
    console.log('Adding mentee to course:', { menteeId: selectedMentee.id, courseId: selectedCourse });
    
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
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
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
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mentees...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mentorData) {
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
                <span className="text-gray-600">Error loading data</span>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Data</h1>
            <p className="text-gray-600 mb-4">Please try refreshing the page or contact support.</p>
            <Link to="/mentor/dashboard" className="text-[#008080] hover:text-teal-700 cursor-pointer">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                <p className="text-2xl font-bold text-gray-900">{menteeRelationships.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Mentees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menteeRelationships.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menteeRelationships.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menteeRelationships.length > 0 
                    ? Math.round(menteeRelationships.reduce((acc, r) => acc + r.progress_percentage, 0) / menteeRelationships.length)
                    : 0}%
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
                {menteeRelationships.map((relationship) => (
                  <tr key={relationship.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{relationship.mentee?.full_name}</div>
                          <div className="text-sm text-gray-500">{relationship.mentee?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(relationship.status)}`}>
                        {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-[#008080] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${relationship.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{relationship.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {relationship.course_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(relationship.assigned_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/mentor/mentee/${relationship.mentee_id}`)}
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
                    <p className="text-gray-900">{selectedMentee.mentee?.full_name || selectedMentee.fullName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-gray-900">{selectedMentee.mentee?.email || selectedMentee.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedMentee.status)}`}>
                      {selectedMentee.status.charAt(0).toUpperCase() + selectedMentee.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Assigned Date</span>
                    <p className="text-gray-900">{new Date(selectedMentee.assigned_date || selectedMentee.joinedDate).toLocaleDateString()}</p>
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
                          style={{ width: `${selectedMentee.progress_percentage || selectedMentee.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{selectedMentee.progress_percentage || selectedMentee.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Course</span>
                    <p className="text-gray-900">{selectedMentee.course_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Notes</span>
                    <p className="text-gray-900">{selectedMentee.notes || 'No notes'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Completion Date</span>
                    <p className="text-gray-900">
                      {selectedMentee.completion_date 
                        ? new Date(selectedMentee.completion_date).toLocaleDateString()
                        : 'In progress'
                      }
                    </p>
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
                  {mentorData.courses?.map(course => (
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