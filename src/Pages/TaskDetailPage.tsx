import { AlertCircle, ArrowLeft, Clock, Send, Target, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Task {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  deadline: string | null;
  status: string;
  createdAt: string;
  course: {
    id: string;
    name: string;
  };
  mentor: {
    id: string;
    name: string;
  };
  submission: {
    id: string;
    submissionLink: string | null;
    submissionNotes: string | null;
    status: string;
    mentorFeedback: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
  } | null;
}

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [submissionData, setSubmissionData] = useState({
    link: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/mentee-get-task-detail?taskId=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task detail');
      }

      const result = await response.json();
      const taskData = result.data;
      setTask(taskData);

      if (taskData.submission) {
        setSubmissionData({
          link: taskData.submission.submissionLink || '',
          notes: taskData.submission.submissionNotes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = async () => {
    if (!submissionData.link.trim() || !taskId) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/mentee-submit-task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          submissionLink: submissionData.link,
          submissionNotes: submissionData.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit task');
      }

      alert('Task submitted successfully!');
      navigate('/tasks');
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubmissionStatus = () => {
    if (!task?.submission) return 'not_submitted';
    return task.submission.status;
  };

  const getSubmissionStatusLabel = () => {
    const status = getSubmissionStatus();
    switch (status) {
      case 'not_submitted':
        return 'Not Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'submitted':
        return 'Submitted';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const isTaskOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
          <Link to="/tasks" className="text-[#008080] hover:text-teal-700 cursor-pointer font-medium">
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const canSubmit = !task.submission || task.submission.status === 'pending' || task.submission.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Welcome, {currentUser?.fullName?.split(' ')[0] || 'User'}</span>
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 font-medium">
                Dashboard
              </Link>
              <Link to="/mentors" className="text-gray-500 hover:text-gray-700 font-medium">
                My Mentors
              </Link>
              <Link to="/profile" className="text-gray-500 hover:text-gray-700 font-medium">
                Profile
              </Link>
              <button
                onClick={() => signOut('/login')}
                className="text-[#008080] hover:text-teal-700 font-medium"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4 absolute top-16 left-0 right-0 shadow-lg">
              <div className="flex flex-col space-y-4">
                <div className="px-4 py-2 text-gray-600 border-b border-gray-200">
                  Welcome, {currentUser?.fullName?.split(' ')[0] || 'User'}
                </div>
                <Link to="/dashboard" className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/mentors" className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  My Mentors
                </Link>
                <Link to="/profile" className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut('/login');
                  }}
                  className="px-4 py-2 text-[#008080] hover:text-teal-700 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-[#008080]" />
                <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getTaskStatusColor(getSubmissionStatus())}`}>
                  {getSubmissionStatusLabel()}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Mentor: {task.mentor.name}</span>
                </div>
                <div>
                  <span>Course: {task.course.name}</span>
                </div>
                {task.deadline && (
                  <div className={`flex items-center gap-2 ${isTaskOverdue(task.deadline) ? 'text-red-600 font-medium' : ''}`}>
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    {isTaskOverdue(task.deadline) && <AlertCircle className="w-4 h-4" />}
                  </div>
                )}
                <div>
                  <span>Assigned: {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Description</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{task.description}</p>

              {task.requirements && task.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Requirements:</h3>
                  <ul className="space-y-2">
                    {task.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <div className="w-1.5 h-1.5 bg-[#008080] rounded-full mt-2 flex-shrink-0"></div>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {task.submission?.mentorFeedback && (
              <div className={`rounded-xl shadow-sm p-6 border ${
                task.submission.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <h2 className={`text-xl font-semibold mb-4 ${
                  task.submission.status === 'approved' ? 'text-green-900' : 'text-red-900'
                }`}>
                  Mentor Feedback
                </h2>
                <p className={`leading-relaxed ${
                  task.submission.status === 'approved' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {task.submission.mentorFeedback}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {task.submission && task.submission.status !== 'pending' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Submission Link:</span>
                    <div className="mt-1">
                      <a
                        href={task.submission.submissionLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#008080] hover:text-teal-700 underline break-all cursor-pointer"
                      >
                        {task.submission.submissionLink}
                      </a>
                    </div>
                  </div>
                  {task.submission.submissionNotes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-600 mt-1">{task.submission.submissionNotes}</p>
                    </div>
                  )}
                  {task.submission.submittedAt && (
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <p className="text-gray-600 mt-1">{new Date(task.submission.submittedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {canSubmit && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {task.submission?.status === 'rejected' ? 'Resubmit Your Work' : 'Submit Your Work'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Link (Netlify/GitHub/etc.) *
                    </label>
                    <input
                      type="url"
                      value={submissionData.link}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      placeholder="https://your-project-link.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={submissionData.notes}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      rows={4}
                      placeholder="Any additional notes about your submission..."
                    />
                  </div>
                  <button
                    onClick={handleSubmission}
                    disabled={!submissionData.link.trim() || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#008080] text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {task.submission?.status === 'rejected' ? 'Resubmit Task' : 'Submit Task'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
