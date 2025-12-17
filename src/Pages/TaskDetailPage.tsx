import { AlertCircle, ArrowLeft, CheckCircle, Clock, Send, Target, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';
import Toast from '../Components/Toast';
import { apiGet } from '../lib/api';

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
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; status?: string } | null>(null);
  const [submissionData, setSubmissionData] = useState({
    link: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.status === 'pending') {
      navigate('/dashboard');
      return;
    }
    fetchTaskDetail();
  }, [taskId, navigate]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiGet(`/mentee-get-task-detail?taskId=${taskId}`);

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

      setToast({ message: 'Task submitted successfully!', type: 'success' });
      fetchTaskDetail();
    } catch (error) {
      console.error('Error submitting task:', error);
      setToast({ message: 'Failed to submit task. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'submitted':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
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
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
        <Navigation
          role="Mentee"
          userName={currentUser?.fullName || 'User'}
          onLogout={signOut}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Link>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse transition-colors"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse transition-colors"></div>
                  <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-full w-28 animate-pulse transition-colors"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-56 animate-pulse transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-40 animate-pulse transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-44 animate-pulse transition-colors"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-40 mb-4 animate-pulse transition-colors"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse transition-colors"></div>
                </div>

                <div className="mt-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-4 animate-pulse transition-colors"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0 transition-colors"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse transition-colors"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-40 mb-4 animate-pulse transition-colors"></div>
                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-2 animate-pulse transition-colors"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse transition-colors"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-2 animate-pulse transition-colors"></div>
                    <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse transition-colors"></div>
                  </div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse transition-colors"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Task Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors">The task you're looking for doesn't exist.</p>
          <Link to="/tasks" className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer font-medium transition-colors">
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const canSubmit = !task.submission || task.submission.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <Navigation
        role="Mentee"
        userName={currentUser?.fullName || 'User'}
        onLogout={signOut}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-[#008080] dark:text-teal-400 transition-colors" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{task.title}</h1>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border transition-colors ${getTaskStatusColor(getSubmissionStatus())}`}>
                  {getSubmissionStatusLabel()}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Mentor: {task.mentor.name}</span>
                </div>
                <div>
                  <span>Course: {task.course.name}</span>
                </div>
                {task.deadline && (
                  <div className={`flex items-center gap-2 ${isTaskOverdue(task.deadline) ? 'text-red-600 dark:text-red-400 font-medium' : ''} transition-colors`}>
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
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Task Description</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 transition-colors">{task.description}</p>

              {task.requirements && Array.isArray(task.requirements) && task.requirements.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                    <CheckCircle className="w-5 h-5 text-[#008080] dark:text-teal-400 transition-colors" />
                    Requirements
                  </h3>
                  <div className="grid gap-3">
                    {task.requirements.map((requirement, index) => (
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
            </div>

            {task.submission?.mentorFeedback && (
              <div className={`rounded-xl shadow-sm p-6 border transition-colors ${
                task.submission.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <h2 className={`text-xl font-semibold mb-4 transition-colors ${
                  task.submission.status === 'approved' ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'
                }`}>
                  Mentor Feedback
                </h2>
                <p className={`leading-relaxed transition-colors ${
                  task.submission.status === 'approved' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {task.submission.mentorFeedback}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {task.submission && (task.submission.status === 'submitted' || task.submission.status === 'pending' || task.submission.status === 'approved') && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Your Submission</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors">Submission Link:</span>
                    <div className="mt-1">
                      <a
                        href={task.submission.submissionLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline break-all cursor-pointer transition-colors"
                      >
                        {task.submission.submissionLink}
                      </a>
                    </div>
                  </div>
                  {task.submission.submissionNotes && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors">Notes:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors">{task.submission.submissionNotes}</p>
                    </div>
                  )}
                  {task.submission.submittedAt && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors">Submitted:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors">{new Date(task.submission.submittedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {canSubmit && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
                  {task.submission?.status === 'rejected' ? 'Resubmit Your Work' : 'Submit Your Work'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Submission Link (Netlify/GitHub/etc.) *
                    </label>
                    <input
                      type="url"
                      value={submissionData.link}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      placeholder="https://your-project-link.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={submissionData.notes}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      rows={4}
                      placeholder="Any additional notes about your submission..."
                    />
                  </div>
                  <button
                    onClick={handleSubmission}
                    disabled={!submissionData.link.trim() || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#008080] dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

export default TaskDetailPage;
