import { ArrowLeft, CheckCircle, Clock, ExternalLink, Eye, Target, User, X, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';

interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  taskRequirements: string | null;
  deadline: string | null;
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  courseId: string;
  courseName: string;
  submissionLink: string | null;
  submissionNotes: string | null;
  submittedAt: string;
  status: string;
  mentorFeedback: string | null;
  reviewedAt: string | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const MentorSubmissionsPage = () => {
  const { signOut } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [feedbackError, setFeedbackError] = useState('');
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.status === 'pending') {
      navigate('/mentor/dashboard');
      return;
    }
    fetchSubmissions();
  }, [navigate]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await fetch('/api/mentor-get-submissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const result = await response.json();
      setSubmissions(result.data.submissions || []);
      setStats(result.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.mentorFeedback || '');
    setFeedbackError('');
    setShowReviewModal(true);
  };

  const handleReviewSubmission = async (action: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;

    if (action === 'rejected' && !feedback.trim()) {
      setFeedbackError('Please provide feedback for rejected submissions.');
      return;
    }

    setFeedbackError('');

    try {
      setReviewLoading(true);
      setReviewAction(action);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/mentor-review-submission', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          status: action,
          feedback: feedback
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to review submission');
      }

      await fetchSubmissions();
      setShowReviewModal(false);
      setFeedback('');
      setFeedbackError('');
      setSelectedSubmission(null);
    } catch (error: any) {
      console.error('Error reviewing submission:', error);
      alert(error.message || 'Failed to review submission');
    } finally {
      setReviewLoading(false);
      setReviewAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
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

  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true;
    return submission.status === filterStatus;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const parseRequirements = (requirements: string | null): string[] => {
    if (!requirements) return [];
    try {
      const parsed = requirements.replace(/^\{/, '[').replace(/\}$/, ']').replace(/\\"/g, '"');
      const result = JSON.parse(parsed);
      if (Array.isArray(result)) {
        return result.map(item => String(item));
      }
      return [String(result)];
    } catch {
      return requirements.split('\n').filter(r => r.trim());
    }
  };

  if (loading) {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
        <Navigation
          role="Mentor"
          userName={storedUser.fullName || 'Mentor'}
          onLogout={() => {
            signOut();
            navigate('/mentor/login');
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/mentor/dashboard"
            className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mr-3 transition-colors"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse transition-colors"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-96 animate-pulse transition-colors"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors"></div>
                  <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                    <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-12 animate-pulse transition-colors"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse transition-colors"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse transition-colors"></div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse transition-colors"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mr-3 transition-colors"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-40 animate-pulse transition-colors"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse transition-colors"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse transition-colors"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse transition-colors"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20 animate-pulse transition-colors"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4 animate-pulse transition-colors"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <Navigation
        role="Mentor"
        userName={currentUser?.fullName || 'Mentor'}
        onLogout={() => {
          signOut();
          navigate('/mentor/login');
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/mentor/dashboard"
          className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-3 transition-colors" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Task Submissions</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 transition-colors">
            Review and provide feedback on mentee task submissions
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-gray-600 dark:text-gray-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 transition-colors" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
            >
              <option value="all">All Submissions</option>
              <option value="submitted">New Submissions</option>
              <option value="pending">Resubmissions (After Rejection)</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {paginatedSubmissions.length > 0 ? (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Task & Mentee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                    {paginatedSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center mr-3 transition-colors">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{submission.taskTitle}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">by {submission.menteeName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 transition-colors">
                          {submission.courseName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${getStatusColor(submission.status)}`}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-1">{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewSubmission(submission)}
                            className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors"
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

            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(endIndex, filteredSubmissions.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredSubmissions.length}</span> submissions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-[40px] px-3 py-2 rounded-lg cursor-pointer font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-[#008080] dark:bg-teal-600 text-white shadow-md hover:bg-teal-700 dark:hover:bg-teal-500'
                                : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors">
            <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">No submissions found</h3>
            <p className="text-gray-500 dark:text-gray-400 transition-colors">
              {filterStatus === 'all'
                ? 'No task submissions yet. Submissions will appear here when mentees submit their work.'
                : `No ${filterStatus} submissions found. Try adjusting your filter.`
              }
            </p>
          </div>
        )}
      </div>

      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Review Submission</h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setFeedback('');
                    setFeedbackError('');
                  }}
                  disabled={reviewLoading}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Task Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Task Title</span>
                    <p className="text-gray-900 dark:text-white transition-colors">{selectedSubmission.taskTitle}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Course</span>
                    <p className="text-gray-900 dark:text-white transition-colors">{selectedSubmission.courseName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Mentee</span>
                    <p className="text-gray-900 dark:text-white transition-colors">{selectedSubmission.menteeName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Due Date</span>
                    <p className="text-gray-900 dark:text-white transition-colors">
                      {selectedSubmission.deadline
                        ? new Date(selectedSubmission.deadline).toLocaleDateString()
                        : 'No deadline'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {selectedSubmission.taskRequirements && parseRequirements(selectedSubmission.taskRequirements).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                    <CheckCircle className="w-5 h-5 text-[#008080] dark:text-teal-400 transition-colors" />
                    Requirements
                  </h3>
                  <div className="grid gap-3">
                    {parseRequirements(selectedSubmission.taskRequirements).map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                        <div className="w-6 h-6 bg-[#008080] dark:bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium transition-colors">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 flex-1 transition-colors">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Submission Details</h3>
                <div className="space-y-4">
                  {selectedSubmission.submissionLink && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Submission Link</span>
                      <div className="mt-1">
                        <a
                          href={selectedSubmission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline cursor-pointer transition-colors"
                        >
                          {selectedSubmission.submissionLink}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedSubmission.submissionNotes && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Mentee Notes</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transition-colors">{selectedSubmission.submissionNotes}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Submitted On</span>
                    <p className="text-gray-900 dark:text-white transition-colors">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Mentor Feedback</h3>
                <textarea
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    if (feedbackError) setFeedbackError('');
                  }}
                  disabled={reviewLoading}
                  className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    feedbackError
                      ? 'border-red-500 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20'
                      : 'border-gray-300 dark:border-gray-700 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20'
                  }`}
                  rows={6}
                  placeholder="Provide detailed feedback on the submission..."
                />
                {feedbackError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 transition-colors">{feedbackError}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3 flex-shrink-0 transition-colors">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setFeedback('');
                  setFeedbackError('');
                }}
                disabled={reviewLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewSubmission('rejected')}
                disabled={reviewLoading}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {reviewLoading && reviewAction === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Reject Submission
              </button>
              <button
                onClick={() => handleReviewSubmission('approved')}
                disabled={reviewLoading}
                className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {reviewLoading && reviewAction === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
