import { ArrowLeft, BookOpen, Edit, Eye, Loader2, Plus, Search, Target, Trash2, User, UserPlus, Users, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';

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
  frequency: string;
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [courseStatus, setCourseStatus] = useState('active');

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
    deadline: '',
    frequency: 'weekly'
  });

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

      const response = await fetch(`/api/mentor-get-course-detail?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

      const response = await fetch('/api/mentor-update-course-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          status: newStatus
        })
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

      const response = await fetch(`/api/mentor-get-assigned-mentees?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

      const response = await fetch('/api/mentor-create-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          ...newLesson
        })
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

      const response = await fetch('/api/mentor-create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          ...newTask,
          requirements: filteredRequirements
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: 'Task created successfully!', type: 'success' });
        setNewTask({ title: '', description: '', requirements: [''], deadline: '', frequency: 'weekly' });
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

      const response = await fetch('/api/mentor-update-lesson', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lessonId: editingLesson.id,
          title: editingLesson.title,
          description: editingLesson.description,
          link: editingLesson.link
        })
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

      const response = await fetch(`/api/mentor-delete-lesson?lessonId=${lessonToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
    if (!editingTask || !editingTask.title.trim() || !editingTask.description.trim() || !editingTask.deadline || !editingTask.frequency) {
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

      const response = await fetch('/api/mentor-update-task', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: editingTask.id,
          title: editingTask.title,
          description: editingTask.description,
          requirements: filteredRequirements,
          deadline: editingTask.deadline,
          frequency: editingTask.frequency || 'weekly'
        })
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

      const response = await fetch(`/api/mentor-delete-task?taskId=${taskToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

      const response = await fetch('/api/mentor-enroll-mentees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          menteeIds: unenrolledSelected
        })
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
      <div className="min-h-screen bg-[#F8F8F8]">
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
          <div className="h-10 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mr-4"></div>
              <div className="flex-1 space-y-2">
                <div className="h-7 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-24 bg-gray-200 rounded animate-pulse"></div>
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
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/mentor/courses" className="text-[#008080] hover:text-teal-700 cursor-pointer">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

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
              <span className="text-gray-600">Course: {course.name}</span>
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
        <button
          onClick={() => navigate('/mentor/courses')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>
            <div className="ml-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Course Status</label>
              <select
                value={courseStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`text-sm font-semibold rounded-full px-4 py-2 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008080]/20 ${getStatusColor(courseStatus)}`}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Duration:</span> {course.duration}</p>
                <p><span className="font-medium">Created:</span> {new Date(course.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> {courseStatus.charAt(0).toUpperCase() + courseStatus.slice(1)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Content</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Enrolled Mentees:</span> {course.enrolledMentees}</p>
                <p><span className="font-medium">Lessons:</span> {course.lessons.length}</p>
                <p><span className="font-medium">Tasks:</span> {course.tasks.length}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowEnrollMenteesModal(true);
                    fetchAvailableMentees();
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Enroll Mentees
                </button>
                <button
                  onClick={() => setShowCreateLessonModal(true)}
                  className="text-[#008080] hover:text-teal-700 text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium text-left cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lessons ({course.lessons.length})</h3>
            </div>

            {course.lessons.length > 0 ? (
              <div className="space-y-3">
                {course.lessons.map((lesson) => (
                  <div key={lesson.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                        <a
                          href={lesson.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008080] hover:text-teal-700 text-sm mt-2 inline-flex items-center gap-1 cursor-pointer"
                        >
                          View Lesson
                          <Eye className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(lesson.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit lesson"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No lessons created yet</p>
                <p className="text-sm text-gray-400">Add lessons to help your mentees learn</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tasks ({course.tasks.length})</h3>
            </div>

            {course.tasks.length > 0 ? (
              <div className="space-y-3">
                {course.tasks.map((task) => (
                  <div key={task.id} className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          <span>Frequency: {task.frequency}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        {task.requirements && Array.isArray(task.requirements) && task.requirements.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Requirements:</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {task.requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit task"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks created yet</p>
                <p className="text-sm text-gray-400">Create tasks to challenge your mentees</p>
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
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Lesson</h2>
                <button
                  onClick={() => {
                    setShowCreateLessonModal(false);
                    setNewLesson({ title: '', description: '', link: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., Introduction to React Components"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={3}
                  placeholder="Brief description of the lesson..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newLesson.link}
                  onChange={(e) => setNewLesson({ ...newLesson, link: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="https://example.com/lesson-url"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCreateLessonModal(false);
                  setNewLesson({ title: '', description: '', link: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLesson}
                disabled={loading}
                className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Lesson</h2>
                <button
                  onClick={() => {
                    setShowEditLessonModal(false);
                    setEditingLesson(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., Introduction to React Components"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingLesson.description}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={3}
                  placeholder="Brief description of the lesson..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={editingLesson.link}
                  onChange={(e) => setEditingLesson({ ...editingLesson, link: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="https://example.com/lesson-url"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLesson}
                disabled={loading}
                className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
                <button
                  onClick={() => {
                    setShowCreateTaskModal(false);
                    setNewTask({ title: '', description: '', requirements: [''], deadline: '', frequency: 'weekly' });
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., Build a Todo App with React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={4}
                  placeholder="Detailed description of the task..."
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Requirements</label>
                  <button
                    onClick={addRequirement}
                    className="text-[#008080] hover:text-teal-700 text-sm font-medium cursor-pointer flex items-center gap-1"
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
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      placeholder="Enter requirement..."
                    />
                    {newTask.requirements.length > 1 && (
                      <button
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newTask.frequency}
                    onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none bg-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setNewTask({ title: '', description: '', requirements: [''], deadline: '', frequency: 'weekly' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
                <button
                  onClick={() => {
                    setShowEditTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  placeholder="e.g., Build a Todo App with React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  rows={3}
                  placeholder="Detailed description of what the mentee needs to accomplish..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
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
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      placeholder="Enter requirement"
                    />
                    {editingTask.requirements.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = editingTask.requirements.filter((_, i) => i !== index);
                          setEditingTask({ ...editingTask, requirements: updated });
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setEditingTask({ ...editingTask, requirements: [...editingTask.requirements, ''] })}
                  className="text-sm text-[#008080] hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Requirement
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingTask.deadline ? new Date(editingTask.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={editingTask.frequency}
                    onChange={(e) => setEditingTask({ ...editingTask, frequency: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none bg-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Enroll Mentees to Course</h2>
                <button
                  onClick={() => {
                    setShowEnrollMenteesModal(false);
                    setSelectedMentees([]);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-shrink-0">
              <p className="text-gray-600 mb-4">
                Select mentees from your assigned list to enroll in "<span className="font-semibold">{course?.name}</span>"
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentees by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  disabled={fetchingMentees}
                />
              </div>
            </div>

            {/* Mentees List - Scrollable Area */}
            <div className="px-6 pb-4 overflow-y-auto flex-1 min-h-0">
              {fetchingMentees ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-[#008080] mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600 font-medium">Loading mentees...</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your assigned mentees</p>
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
                        className={`flex items-center p-4 border rounded-lg transition-all ${
                          mentee.isEnrolled
                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : selectedMentees.includes(mentee.id)
                            ? 'border-[#008080] bg-[#008080]/5 cursor-pointer'
                            : 'border-gray-200 hover:border-[#008080]/50 hover:bg-gray-50 cursor-pointer'
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
                        <div className="mr-3 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={mentee.isEnrolled || selectedMentees.includes(mentee.id)}
                            disabled={mentee.isEnrolled}
                            onChange={() => {}}
                            className="w-5 h-5 rounded border-gray-300 text-[#008080] focus:ring-[#008080] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer accent-[#008080]"
                            style={{
                              accentColor: '#008080'
                            }}
                          />
                        </div>
                        <div className="flex items-start flex-1">
                          <div className={`w-10 h-10 ${mentee.isEnrolled ? 'bg-gray-400' : 'bg-[#008080]'} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-gray-900">{mentee.fullName}</div>
                              {mentee.isEnrolled && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                  Enrolled
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mb-1">{mentee.email}</div>
                            {mentee.careerPath && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Target className="w-3.5 h-3.5 text-[#008080]" />
                                <span className="text-xs font-medium text-[#008080] bg-[#008080]/10 px-2 py-0.5 rounded">
                                  {mentee.careerPath}
                                </span>
                              </div>
                            )}
                            {mentee.membershipCategory && !mentee.careerPath && (
                              <div className="text-xs text-gray-400 mt-1">
                                {mentee.membershipCategory}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                          mentee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {mentee.status}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mentees Assigned</h3>
                  <p className="text-gray-500">
                    You don't have any mentees assigned yet. Contact your administrator to assign mentees to you.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 flex justify-between items-center flex-shrink-0">
              <div className="text-sm text-gray-600">
                <p className="font-medium">
                  {selectedMentees.length} mentee{selectedMentees.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {availableMentees.filter(m => m.isEnrolled).length} enrolled • {availableMentees.filter(m => !m.isEnrolled).length} available
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEnrollMenteesModal(false);
                    setSelectedMentees([]);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollMentees}
                  disabled={selectedMentees.length === 0 || loading}
                  className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Enrolling...' : `Enroll ${selectedMentees.length} Mentee${selectedMentees.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lesson Modal */}
      {showDeleteLessonModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Lesson</h2>
              <p className="text-gray-600">
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLesson}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Task</h2>
              <p className="text-gray-600">
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
