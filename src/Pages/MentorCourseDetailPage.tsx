import { ArrowLeft, BookOpen, Edit, Eye, Loader2, Plus, Search, Target, Trash2, User, UserPlus, Users, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';
import Navigation from '../Components/Navigation';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

interface Course {
  id: string;
  name: string;
  duration: string;
  description: string;
  status: string;
  enrolledMentees: number;
  createdAt: string;
  lessons: Lesson[];
  tasks: Task[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  requirements: string[];
  createdAt: string;
}

interface Mentee {
  id: string;
  fullName: string;
  email: string;
  careerPath?: string;
  membershipCategory?: string;
  profilePicture?: string;
  status: string;
  isEnrolled: boolean;
}

const MentorCourseDetailPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; } | null>(null);
  const [courseStatus, setCourseStatus] = useState('active');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEnrollMenteesModal, setShowEnrollMenteesModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [availableMentees, setAvailableMentees] = useState<Mentee[]>([]);
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMentees, setFetchingMentees] = useState(false);

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    link: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    requirements: [''],
    deadline: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.status === 'pending') {
      navigate('/mentor/dashboard');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setPageLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await apiGet(`/mentor-get-course-detail?courseId=${courseId}`);

      const data = await response.json();

      if (response.ok && data.success) {
        setCourse(data.data);
        setCourseStatus(data.data.status);
      } else {
        setToast({ message: data.error || 'Failed to fetch course details', type: 'error' });
        if (response.status === 404) {
          setTimeout(() => navigate('/mentor/courses'), 2000);
        }
      }
    } catch (error) {
      console.error('Fetch course details error:', error);
      setToast({ message: 'Failed to fetch course details', type: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Please log in again', type: 'error' });
        navigate('/mentor/login');
        return;
      }

      const response = await apiPut('/mentor-update-course-status', {
        courseId,
        status: newStatus
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCourseStatus(newStatus);
        if (course) {
          setCourse({ ...course, status: newStatus });
        }
        setToast({ message: 'Course status updated successfully!', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to update course status', type: 'error' });
      }
    } catch (error) {
      console.error('Update status error:', error);
      setToast({ message: 'Failed to update course status', type: 'error' });
    }
  };

  const fetchAvailableMentees = async () => {
    setFetchingMentees(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFetchingMentees(false);
        return;
      }

      const response = await apiGet(`/mentor-get-assigned-mentees?courseId=${courseId}`);

      const data = await response.json();

      if (response.ok && data.success) {
        setAvailableMentees(data.data);
      } else {
        setToast({ message: data.error || 'Failed to fetch mentees', type: 'error' });
      }
    } catch (error) {
      console.error('Fetch mentees error:', error);
      setToast({ message: 'Failed to fetch mentees', type: 'error' });
    } finally {
      setFetchingMentees(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!newLesson.title.trim() || !newLesson.link.trim()) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await apiPost('/mentor-create-lesson', {
        courseId,
        ...newLesson
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Lesson created successfully!', type: 'success' });
        setNewLesson({ title: '', description: '', link: '' });
        setShowCreateLessonModal(false);
        fetchCourseDetails();
      } else {
        setToast({ message: data.error || 'Failed to create lesson', type: 'error' });
      }
    } catch (error) {
      console.error('Create lesson error:', error);
      setToast({ message: 'Failed to create lesson', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.deadline) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const filteredRequirements = newTask.requirements.filter(req => req.trim() !== '');

      const response = await apiPost('/mentor-create-task', {
        courseId,
        ...newTask,
        requirements: filteredRequirements
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Task created successfully!', type: 'success' });
        setNewTask({ title: '', description: '', requirements: [''], deadline: '' });
        setShowCreateTaskModal(false);
        fetchCourseDetails();
      } else {
        setToast({ message: data.error || 'Failed to create task', type: 'error' });
      }
    } catch (error) {
      console.error('Create task error:', error);
      setToast({ message: 'Failed to create task', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowEditLessonModal(true);
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson || !editingLesson.title.trim() || !editingLesson.link.trim()) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await apiPut('/mentor-update-lesson', {
        lessonId: editingLesson.id,
        title: editingLesson.title,
        description: editingLesson.description,
        link: editingLesson.link
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Lesson updated successfully!', type: 'success' });
        setShowEditLessonModal(false);
        setEditingLesson(null);
        fetchCourseDetails();
      } else {
        setToast({ message: data.error || 'Failed to update lesson', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      setToast({ message: 'Failed to update lesson', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessonToDelete(lessonId);
    setShowDeleteLessonModal(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await apiDelete(`/mentor-delete-lesson?lessonId=${lessonToDelete}`);

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Lesson deleted successfully!', type: 'success' });
        setShowDeleteLessonModal(false);
        setLessonToDelete(null);
        fetchCourseDetails();
      } else {
        setToast({ message: data.error || 'Failed to delete lesson', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setToast({ message: 'Failed to delete lesson', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    const requirements = Array.isArray(task.requirements) && task.requirements.length > 0
      ? task.requirements
      : [''];
    setEditingTask({
      ...task,
      requirements
    });
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title.trim() || !editingTask.description.trim() || !editingTask.deadline) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const filteredRequirements = editingTask.requirements.filter(req => req.trim() !== '');

      const response = await apiPut('/mentor-update-task', {
        taskId: editingTask.id,
        title: editingTask.title,
        description: editingTask.description,
        requirements: filteredRequirements,
        deadline: editingTask.deadline
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Task updated successfully!', type: 'success' });
        setShowEditTaskModal(false);
        setEditingTask(null);
        fetchCourseDetails();
      } else {
        setToast({ message: data.error || 'Failed to update task', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setToast({ message: 'Failed to update task', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteTaskModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await apiDelete(`/mentor-delete-task?taskId=${taskToDelete}`);

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Task deleted successfully!', type: 'success' });
        setShowDeleteTaskModal(false);
        setTaskToDelete(null);
        fetchCourseDetails();
      } else {
        setToast({ message: data.error || 'Failed to delete task', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setToast({ message: 'Failed to delete task', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollMentees = async () => {
    const unenrolledSelected = selectedMentees.filter(id => {
      const mentee = availableMentees.find(m => m.id === id);
      return mentee && !mentee.isEnrolled;
    });

    if (unenrolledSelected.length === 0) {
      setToast({ message: 'Please select at least one mentee who is not already enrolled', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/mentor/login');
        return;
      }

      const response = await apiPost('/mentor-enroll-mentees', {
        courseId,
        menteeIds: unenrolledSelected
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({
          message: `${data.data.enrolledCount} mentee(s) enrolled successfully!`,
          type: 'success'
        });
        setSelectedMentees([]);
        setShowEnrollMenteesModal(false);
        fetchCourseDetails();
        fetchAvailableMentees();
      } else {
        setToast({ message: data.error || 'Failed to enroll mentees', type: 'error' });
      }
    } catch (error) {
      console.error('Enroll mentees error:', error);
      setToast({ message: 'Failed to enroll mentees', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    setNewTask(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setNewTask(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    if (newTask.requirements.length > 1) {
      setNewTask(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ended':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
        <Navigation
          role="Mentor"
          userName={currentUser?.fullName || 'Mentor'}
          onLogout={() => {
            navigate('/mentor/login');
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/mentor/courses')}
            className="flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mr-4 transition-colors"></div>
              <div className="flex-1 space-y-2">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse transition-colors"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse transition-colors"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse transition-colors"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse transition-colors"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse transition-colors"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Course Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors">The course you're looking for doesn't exist.</p>
          <Link to="/mentor/courses" className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors">
            Back to Courses
          </Link>
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
          navigate('/mentor/login');
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/mentor/courses')}
          className="flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="w-16 h-16 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 transition-colors">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{course.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">{course.description}</p>
              </div>
            </div>
            <div className="ml-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">Course Status</label>
              <select
                value={courseStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`text-sm font-semibold rounded-full px-4 py-2 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 transition-colors ${getStatusColor(courseStatus)}`}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Course Details</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                <p><span className="font-medium text-gray-900 dark:text-gray-300">Duration:</span> {course.duration}</p>
                <p><span className="font-medium text-gray-900 dark:text-gray-300">Created:</span> {new Date(course.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium text-gray-900 dark:text-gray-300">Status:</span> {courseStatus.charAt(0).toUpperCase() + courseStatus.slice(1)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Course Content</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                <p><span className="font-medium text-gray-900 dark:text-gray-300">Enrolled Mentees:</span> {course.enrolledMentees}</p>
                <p><span className="font-medium text-gray-900 dark:text-gray-300">Lessons:</span> {course.lessons.length}</p>
                <p><span className="font-medium text-gray-900 dark:text-gray-300">Tasks:</span> {course.tasks.length}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowEnrollMenteesModal(true);
                    fetchAvailableMentees();
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium text-left cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Enroll Mentees
                </button>
                <button
                  onClick={() => setShowCreateLessonModal(true)}
                  className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium text-left cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 text-sm font-medium text-left cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Lessons ({course.lessons.length})</h3>
            </div>

            {course.lessons.length > 0 ? (
              <div className="space-y-3">
                {course.lessons.map((lesson) => (
                  <div key={lesson.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white transition-colors">{lesson.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">{lesson.description}</p>
                        <a
                          href={lesson.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm mt-2 inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          View Lesson
                          <Eye className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors">
                          Created: {new Date(lesson.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Edit lesson"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Delete lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 transition-colors">No lessons created yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors">Add lessons to help your mentees learn</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Tasks ({course.tasks.length})</h3>
            </div>

            {course.tasks.length > 0 ? (
              <div className="space-y-3">
                {course.tasks.map((task) => (
                  <div key={task.id} className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-base transition-colors">{task.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors ${task.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                            }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 transition-colors">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 transition-colors">
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-900 dark:text-gray-300">Due:</span>
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                          {task.requirements && Array.isArray(task.requirements) && task.requirements.length > 0 && (
                            <span className="text-[#008080] dark:text-teal-400 font-medium transition-colors">
                              {task.requirements.length} requirement{task.requirements.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-gray-400 dark:text-gray-500 transition-colors">
                            Created {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Edit task"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 transition-colors" />
                <p className="text-gray-500 dark:text-gray-400 transition-colors">No tasks created yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors">Create tasks to challenge your mentees</p>
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

      {/* Create Lesson Modal */}
      {showCreateLessonModal && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl dark:shadow-gray-950/50 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Create New Lesson</h2>
                <button
                  onClick={() => {
                    setShowCreateLessonModal(false);
                    setNewLesson({ title: '', description: '', link: '' });
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Lesson Title <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="e.g., Introduction to React Components"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Description</label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  rows={3}
                  placeholder="Brief description of the lesson..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Lesson URL <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={newLesson.link}
                  onChange={(e) => setNewLesson({ ...newLesson, link: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="https://example.com/lesson-url"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3 flex-shrink-0 transition-colors">
              <button
                onClick={() => {
                  setShowCreateLessonModal(false);
                  setNewLesson({ title: '', description: '', link: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLesson}
                disabled={loading}
                className="px-4 py-2 bg-[#008080] dark:bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {showEditLessonModal && editingLesson && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl dark:shadow-gray-950/50 transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Edit Lesson</h2>
                <button
                  onClick={() => {
                    setShowEditLessonModal(false);
                    setEditingLesson(null);
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Lesson Title <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="e.g., Introduction to React Components"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Description</label>
                <textarea
                  value={editingLesson.description}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  rows={3}
                  placeholder="Brief description of the lesson..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Lesson URL <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={editingLesson.link}
                  onChange={(e) => setEditingLesson({ ...editingLesson, link: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="https://example.com/lesson-url"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3 flex-shrink-0 transition-colors">
              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLesson}
                disabled={loading}
                className="px-4 py-2 bg-[#008080] dark:bg-teal-600 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Updating...' : 'Update Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Create New Task</h2>
                <button
                  onClick={() => {
                    setShowCreateTaskModal(false);
                    setNewTask({ title: '', description: '', requirements: [''], deadline: '' });
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Task Title <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="e.g., Build a Todo App with React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Description <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  rows={4}
                  placeholder="Detailed description of the task..."
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Requirements</label>
                  <button
                    onClick={addRequirement}
                    className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Requirement
                  </button>
                </div>
                {newTask.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      placeholder="Enter requirement..."
                    />
                    {newTask.requirements.length > 1 && (
                      <button
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Due Date <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3 flex-shrink-0 transition-colors">
              <button
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setNewTask({ title: '', description: '', requirements: [''], deadline: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Edit Task</h2>
                <button
                  onClick={() => {
                    setShowEditTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Task Title <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="e.g., Build a Todo App with React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Description <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  rows={3}
                  placeholder="Detailed description of what the mentee needs to accomplish..."
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Requirements</label>
                  <button
                    onClick={() => setEditingTask({ ...editingTask, requirements: [...editingTask.requirements, ''] })}
                    className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm font-medium cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Requirement
                  </button>
                </div>
                {editingTask.requirements && editingTask.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const updated = [...editingTask.requirements];
                        updated[index] = e.target.value;
                        setEditingTask({ ...editingTask, requirements: updated });
                      }}
                      className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      placeholder="Enter requirement..."
                    />
                    {editingTask.requirements.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = editingTask.requirements.filter((_, i) => i !== index);
                          setEditingTask({ ...editingTask, requirements: updated });
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Deadline <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={editingTask.deadline ? new Date(editingTask.deadline).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3 flex-shrink-0 transition-colors">
              <button
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Updating...' : 'Update Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Mentees Modal */}
      {showEnrollMenteesModal && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col transition-colors">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors">Enroll Mentees</h2>
                <button
                  onClick={() => {
                    setShowEnrollMenteesModal(false);
                    setSelectedMentees([]);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 flex-shrink-0">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 transition-colors">
                Select mentees to enroll in "<span className="font-semibold text-gray-900 dark:text-white">{course?.name}</span>"
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search mentees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors text-sm sm:text-base"
                  disabled={fetchingMentees}
                />
              </div>
            </div>

            {/* Mentees List - Scrollable Area */}
            <div className="px-4 sm:px-6 pb-4 overflow-y-auto flex-1 min-h-0">
              {fetchingMentees ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-[#008080] dark:text-teal-400 mx-auto mb-4 animate-spin transition-colors" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium transition-colors">Loading mentees...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 transition-colors">Please wait while we fetch your assigned mentees</p>
                </div>
              ) : availableMentees.length > 0 ? (
                <div className="space-y-2">
                  {availableMentees
                    .filter(mentee =>
                      mentee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      mentee.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((mentee) => (
                      <div
                        key={mentee.id}
                        className={`flex items-start p-3 sm:p-4 border rounded-lg transition-all ${mentee.isEnrolled
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                            : selectedMentees.includes(mentee.id)
                              ? 'border-[#008080] dark:border-teal-600 bg-[#008080]/5 dark:bg-teal-600/10 cursor-pointer'
                              : 'border-gray-200 dark:border-gray-700 hover:border-[#008080]/50 dark:hover:border-teal-600/50 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                          }`}
                        onClick={() => {
                          if (mentee.isEnrolled) return;
                          if (selectedMentees.includes(mentee.id)) {
                            setSelectedMentees(selectedMentees.filter(id => id !== mentee.id));
                          } else {
                            setSelectedMentees([...selectedMentees, mentee.id]);
                          }
                        }}
                      >
                        <div className="mr-2 sm:mr-3 flex-shrink-0 pt-0.5">
                          <input
                            type="checkbox"
                            checked={mentee.isEnrolled || selectedMentees.includes(mentee.id)}
                            disabled={mentee.isEnrolled}
                            onChange={() => { }}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 dark:border-gray-600 text-[#008080] focus:ring-[#008080] dark:focus:ring-teal-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer accent-[#008080] dark:accent-teal-400 transition-colors"
                            style={{
                              accentColor: '#008080'
                            }}
                          />
                        </div>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${mentee.isEnrolled ? 'bg-gray-400 dark:bg-gray-600' : 'bg-[#008080] dark:bg-teal-600'} rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 transition-colors`}>
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white transition-colors truncate">{mentee.fullName}</div>
                            {mentee.isEnrolled && (
                              <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 transition-colors">
                                Enrolled
                              </span>
                            )}
                            <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full transition-colors sm:hidden ${mentee.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                              }`}>
                              {mentee.status}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate transition-colors">{mentee.email}</div>
                          {mentee.careerPath && (
                            <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5">
                              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#008080] dark:text-teal-400 transition-colors flex-shrink-0" />
                              <span className="text-[10px] sm:text-xs font-medium text-[#008080] dark:text-teal-400 bg-[#008080]/10 dark:bg-teal-400/10 px-1.5 sm:px-2 py-0.5 rounded transition-colors truncate">
                                {mentee.careerPath}
                              </span>
                            </div>
                          )}
                          {mentee.membershipCategory && !mentee.careerPath && (
                            <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1 truncate transition-colors">
                              {mentee.membershipCategory}
                            </div>
                          )}
                        </div>
                        <span className={`hidden sm:inline-block text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2 transition-colors ${mentee.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                          }`}>
                          {mentee.status}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">No Mentees Assigned</h3>
                  <p className="text-gray-500 dark:text-gray-400 transition-colors">
                    You don't have any mentees assigned yet. Contact your administrator to assign mentees to you.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 flex-shrink-0 transition-colors">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors">
                <p className="font-medium">
                  {selectedMentees.length} mentee{selectedMentees.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1">
                  {availableMentees.filter(m => m.isEnrolled).length} enrolled | {availableMentees.filter(m => !m.isEnrolled).length} available
                </p>
              </div>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => {
                    setShowEnrollMenteesModal(false);
                    setSelectedMentees([]);
                    setSearchTerm('');
                  }}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollMentees}
                  disabled={selectedMentees.length === 0 || loading}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#008080] dark:bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Enrolling...' : `Enroll (${selectedMentees.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lesson Modal */}
      {showDeleteLessonModal && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Delete Lesson</h2>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">
                Are you sure you want to delete this lesson? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteLessonModal(false);
                  setLessonToDelete(null);
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLesson}
                disabled={loading}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {showDeleteTaskModal && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 transition-colors">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Delete Task</h2>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteTaskModal(false);
                  setTaskToDelete(null);
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                disabled={loading}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorCourseDetailPage;
