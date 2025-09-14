import { ArrowLeft, CheckCircle, Clock, ExternalLink, Eye, MessageSquare, Target, User, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockSubmissionsData = {
  fullName: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@slinttech.org',
  specialization: 'Full Stack Development',
  submissions: [
    {
      id: 1,
      taskTitle: 'Build a Todo App with React',
      menteeName: 'John Doe',
      menteeEmail: 'john.doe@example.com',
      courseName: 'React Fundamentals',
      submittedAt: '2024-01-20T10:30:00Z',
      submissionLink: 'https://github.com/johndoe/todo-app',
      submissionNotes: 'Implemented all required features with additional styling and local storage persistence. Added responsive design for mobile devices.',
      status: 'pending',
      mentorFeedback: '',
      dueDate: '2024-02-15',
      requirements: [
        'Use React functional components and hooks',
        'Implement CRUD operations for todos',
        'Add local storage persistence',
        'Make it responsive for mobile and desktop'
      ]
    },
    {
      id: 2,
      taskTitle: 'Responsive Portfolio Website',
      menteeName: 'Jane Smith',
      menteeEmail: 'jane.smith@example.com',
      courseName: 'React Fundamentals',
      submittedAt: '2024-01-19T14:15:00Z',
      submissionLink: 'https://netlify.app/jane-portfolio',
      submissionNotes: 'Created a modern portfolio with smooth animations and mobile-first approach. Included contact form and project showcase.',
      status: 'approved',
      mentorFeedback: 'Excellent work! Great attention to detail and smooth animations. The mobile responsiveness is perfect. Well done on the contact form implementation.',
      dueDate: '2024-02-20',
      requirements: [
        'Mobile-first responsive design',
        'Portfolio showcase section',
        'Contact form functionality',
        'Modern design with animations'
      ]
    },
    {
      id: 3,
      taskTitle: 'API Integration Exercise',
      menteeName: 'Mike Johnson',
      menteeEmail: 'mike.johnson@example.com',
      courseName: 'Advanced JavaScript',
      submittedAt: '2024-01-18T09:45:00Z',
      submissionLink: 'https://github.com/mikej/api-project',
      submissionNotes: 'Integrated REST API with error handling and loading states. Used fetch API for all requests.',
      status: 'rejected',
      mentorFeedback: 'Good attempt, but the error handling needs improvement. Please add proper loading states and better user feedback for failed requests. Also, consider adding retry functionality for failed API calls.',
      dueDate: '2024-02-10',
      requirements: [
        'Fetch data from a public API',
        'Implement loading states',
        'Handle error scenarios gracefully',
        'Display data in a clean format'
      ]
    },
    {
      id: 4,
      taskTitle: 'JavaScript Calculator',
      menteeName: 'Sarah Wilson',
      menteeEmail: 'sarah.wilson@example.com',
      courseName: 'Advanced JavaScript',
      submittedAt: '2024-01-21T16:20:00Z',
      submissionLink: 'https://codepen.io/sarahw/pen/calculator',
      submissionNotes: 'Built a fully functional calculator with keyboard support and error handling for division by zero.',
      status: 'pending',
      mentorFeedback: '',
      dueDate: '2024-02-28',
      requirements: [
        'Basic arithmetic operations (+, -, *, /)',
        'Keyboard input support',
        'Error handling for invalid operations',
        'Clear and reset functionality'
      ]
    }
  ]
};

const MentorSubmissionsPage = () => {
  const [submissionsData, setSubmissionsData] = useState(mockSubmissionsData);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [reviewAction, setReviewAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.mentorFeedback || '');
    setShowReviewModal(true);
  };

  const handleReviewSubmission = (action) => {
    if (!feedback.trim() && action === 'rejected') {
      alert('Please provide feedback for rejected submissions.');
      return;
    }

    setSubmissionsData(prev => ({
      ...prev,
      submissions: prev.submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? { 
              ...sub, 
              status: action,
              mentorFeedback: feedback
            }
          : sub
      )
    }));

    setShowReviewModal(false);
    setFeedback('');
    alert(`Submission ${action} successfully!`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredSubmissions = submissionsData.submissions.filter(submission => {
    if (filterStatus === 'all') return true;
    return submission.status === filterStatus;
  });

  const pendingCount = submissionsData.submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissionsData.submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissionsData.submissions.filter(s => s.status === 'rejected').length;

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
              <span className="text-gray-600">Welcome, {submissionsData.fullName}</span>
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
            <Target className="w-8 h-8 text-[#008080] mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Task Submissions</h1>
          </div>
          <p className="text-gray-600">
            Review and provide feedback on mentee task submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{submissionsData.submissions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task & Mentee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.taskTitle}</div>
                          <div className="text-sm text-gray-500">by {submission.menteeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewSubmission(submission)}
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
        {filteredSubmissions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? 'No task submissions yet. Submissions will appear here when mentees submit their work.'
                : `No ${filterStatus} submissions found. Try adjusting your filter.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Review Submission</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Task Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Task Title</span>
                    <p className="text-gray-900">{selectedSubmission.taskTitle}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Course</span>
                    <p className="text-gray-900">{selectedSubmission.courseName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Mentee</span>
                    <p className="text-gray-900">{selectedSubmission.menteeName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Due Date</span>
                    <p className="text-gray-900">{new Date(selectedSubmission.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedSubmission.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-[#008080] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Submission Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Submission Link</span>
                    <div className="mt-1">
                      <a 
                        href={selectedSubmission.submissionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 underline cursor-pointer"
                      >
                        {selectedSubmission.submissionLink}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Mentee Notes</span>
                    <p className="text-gray-600 mt-1 bg-gray-50 p-3 rounded-lg">{selectedSubmission.submissionNotes}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Submitted On</span>
                    <p className="text-gray-900">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor Feedback</h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={6}
                  placeholder="Provide detailed feedback on the submission..."
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewSubmission('rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Reject Submission
              </button>
              <button
                onClick={() => handleReviewSubmission('approved')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                Approve Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorSubmissionsPage;