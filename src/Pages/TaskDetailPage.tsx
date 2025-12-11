import { AlertCircle, ArrowLeft, CheckCircle, Clock, Send, Target, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../Components/Navigation';
import Toast from '../Components/Toast';

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
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
      <div className="min-h-screen bg-[#F8F8F8]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                  <div className="h-7 bg-gray-200 rounded-full w-28 animate-pulse"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-56 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-44 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>

                <div className="mt-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-24 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
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

  const canSubmit = !task.submission || task.submission.status === 'rejected';

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

              {task.requirements && Array.isArray(task.requirements) && task.requirements.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#008080]" />
                    Requirements
                  </h3>
                  <div className="grid gap-3">
                    {task.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-6 h-6 bg-[#008080] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 flex-1">{requirement}</span>
                      </div>
                    ))}
                  </div>
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
            {task.submission && (task.submission.status === 'submitted' || task.submission.status === 'pending' || task.submission.status === 'approved') && (
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
