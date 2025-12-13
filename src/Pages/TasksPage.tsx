import { AlertCircle, ArrowLeft, Clock, Target, User, Search, ChevronLeft, ChevronRight, Eye, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TableSkeletonLoader } from '../Components/SkeletonLoader';
import Navigation from '../Components/Navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
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

const TasksPage = () => {
  const { signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMentor, setFilterMentor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/mentee-get-tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      setTasks(result.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = tasks.filter(task =>
    !task.submission || task.submission.status === 'pending' || task.submission.status === 'submitted' || task.submission.status === 'rejected'
  );

  const completedTasks = tasks.filter(task =>
    task.submission && task.submission.status === 'approved'
  );

  const tasksToShow = showCompleted ? completedTasks : activeTasks;

  const filteredTasks = tasksToShow.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMentor = filterMentor === 'all' || task.mentor.name === filterMentor;
    const matchesStatus = filterStatus === 'all' || (task.submission ? task.submission.status === filterStatus : filterStatus === 'not_submitted');

    return matchesSearch && matchesMentor && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const uniqueMentors = [...new Set(tasks.map(task => task.mentor.name))];

  const approvedTasks = completedTasks.length;
  const totalTasks = tasks.length;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const getTaskStatus = (task: Task) => {
    if (!task.submission) return 'not_submitted';
    return task.submission.status;
  };

  const getTaskStatusLabel = (task: Task) => {
    const status = getTaskStatus(task);
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

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <Navigation
        role="Mentee"
        userName={currentUser?.fullName || 'User'}
        onLogout={() => signOut('/login')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-[#008080] dark:text-teal-400 mr-3 transition-colors" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Tasks & Assignments</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors">
            Submit your assignments and track your progress
          </p>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Tasks Approved</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                {approvedTasks}/{totalTasks} approved
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 transition-colors">
              <div
                className="bg-yellow-500 dark:bg-yellow-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalTasks > 0 ? (approvedTasks / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors">
              {totalTasks > 0 ? Math.round((approvedTasks / totalTasks) * 100) : 0}% approved
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 transition-colors">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterMentor}
                onChange={(e) => {
                  setFilterMentor(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
              >
                <option value="all">All Mentors</option>
                {uniqueMentors.map(mentor => (
                  <option key={mentor} value={mentor}>{mentor}</option>
                ))}
              </select>

              {!showCompleted && (
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="not_submitted">Not Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setShowCompleted(false);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              !showCompleted
                ? 'bg-[#008080] dark:bg-teal-600 text-white hover:bg-teal-700 dark:hover:bg-teal-500'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Active Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => {
              setShowCompleted(true);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              showCompleted
                ? 'bg-[#008080] dark:bg-teal-600 text-white hover:bg-teal-700 dark:hover:bg-teal-500'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Completed Tasks ({completedTasks.length})
          </button>
        </div>

        {loading ? (
          <TableSkeletonLoader />
        ) : paginatedTasks.length > 0 ? (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Mentor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                    {paginatedTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{task.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center mr-2 transition-colors">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white transition-colors">{task.mentor.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 transition-colors">
                          {task.course.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border transition-colors ${getTaskStatusColor(getTaskStatus(task))}`}>
                            {getTaskStatusLabel(task)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.deadline ? (
                            <div className={`text-sm ${isTaskOverdue(task.deadline) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-gray-300'} transition-colors`}>
                              {new Date(task.deadline).toLocaleDateString()}
                              {isTaskOverdue(task.deadline) && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span className="text-xs">Overdue</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors">No deadline</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/task/${task.id}`)}
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
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(endIndex, filteredTasks.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredTasks.length}</span> tasks
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors">
              {showCompleted ? 'No completed tasks yet' : 'No active tasks found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 transition-colors">
              {showCompleted
                ? 'Complete some tasks to see them here!'
                : filteredTasks.length === 0 && (searchTerm || filterMentor !== 'all' || filterStatus !== 'all')
                  ? 'Try adjusting your search or filters.'
                  : 'Your mentors will assign tasks for you to complete. Check back later!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
