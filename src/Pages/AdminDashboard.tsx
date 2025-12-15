import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Download, CreditCard as Edit, Eye, FileText, Mail, MessageSquare, Plus, Search, Trash2, User, Users, X, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile } from '../hooks/useAuth';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';
import { Link, useNavigate } from 'react-router-dom';
import { StatsSkeletonLoader, TableSkeletonLoader } from '../Components/SkeletonLoader';
import { useDebounce } from '../hooks/useDebounce';
import Navigation from '../Components/Navigation';

interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  membershipCategory: 'Student' | 'Professional' | 'Volunteer';
  careerPath: string;
  role: 'Admin' | 'Mentor' | 'Mentee';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  specialization?: string;
  contractFileUrl?: string;
  membershipEnabled: boolean;
  membershipAmount: string;
  membershipPaid: boolean;
  paymentReference?: string;
  paymentDate?: string;
  communityLink?: string;
  createdAt: string;
  updatedAt: string;
}

interface MentorOption {
  id: string;
  full_name: string;
  specialization: string;
}

const courseOptions = [
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Machine Learning/AI',
  'Data Science',
  'UI/UX Design'
];

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterMembershipCategory, setFilterMembershipCategory] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [availableMentors, setAvailableMentors] = useState<MentorOption[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const usersPerPage = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    membershipCategory: '',
    careerPath: '',
    role: '',
    status: 'pending',
    password: '',
    membershipEnabled: true,
    membershipAmount: 30
  });

  const [editingUser, setEditingUser] = useState({
    fullName: '',
    password: '',
    email: '',
    membershipCategory: '',
    careerPath: '',
    role: '',
    communityLink: '',
    mentorAssignments: [],
    status: 'pending',
    membershipEnabled: false,
    membershipAmount: 30
  });

  // Check if current user is admin
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isAdmin = currentUser.role === 'Admin';

  useEffect(() => {
    if (!isAdmin) {
      setToast({
        message: 'Access denied. Admin privileges required.',
        type: 'error'
      });
      return;
    }

    fetchStats();
    fetchAvailableMentors();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterRole, filterMembershipCategory]);

  useEffect(() => {
    if (!isAdmin) return;

    fetchUsers();
  }, [currentPage, debouncedSearchTerm, filterStatus, filterRole, filterMembershipCategory]);

  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      setIsLoadingUsers(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin-get-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: currentPage,
          perPage: usersPerPage,
          search: debouncedSearchTerm || '',
          status: filterStatus,
          role: filterRole,
          membershipCategory: filterMembershipCategory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const result = await response.json();
      setUsers(result.users || []);
      setTotalUsers(result.totalCount || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      setToast({
        message: 'Failed to fetch users. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoadingUsers(false);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAdmin) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin-get-stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const { stats: statsData } = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAvailableMentors = async () => {
    if (!isAdmin) return;

    setIsLoadingMentors(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoadingMentors(false);
        return;
      }

      const response = await fetch('/api/admin-get-mentors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch mentors:', errorData);
        setToast({
          message: `Failed to load mentors: ${errorData.error || 'Unknown error'}`,
          type: 'error'
        });
        return;
      }

      const { mentors } = await response.json();
      setAvailableMentors(mentors || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setToast({
        message: 'Failed to load mentors',
        type: 'error'
      });
    } finally {
      setIsLoadingMentors(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setFilterStatus(value);
    } else if (filterType === 'role') {
      setFilterRole(value);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDownloadContract = async (userId: string, userName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Authentication required',
          type: 'error'
        });
        return;
      }

      setToast({
        message: 'Downloading contract...',
        type: 'success'
      });

      const response = await fetch(`/api/download-contract?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to download contract');
        } else {
          throw new Error('Failed to download contract');
        }
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `${userName.replace(/[^a-zA-Z0-9 ]/g, '_').trim()}_contract.pdf`;

      if (contentDisposition) {
        // Match filename with or without quotes, and extract just the name
        const fileNameMatch = contentDisposition.match(/filename="([^"]+)"|filename=([^\s;]+)/i);
        if (fileNameMatch) {
          // Use the quoted version (group 1) if available, otherwise the unquoted version (group 2)
          fileName = fileNameMatch[1] || fileNameMatch[2];
        }
      }

      // Get the file as a blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setToast({
        message: 'Contract downloaded successfully!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error downloading contract:', error);
      setToast({
        message: error.message || 'Failed to download contract',
        type: 'error'
      });
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Reset create user form to defaults
  const resetCreateUserForm = () => {
    setNewUser({
      fullName: '',
      email: '',
      membershipCategory: '',
      careerPath: '',
      role: '',
      status: 'pending',
      password: '',
      membershipEnabled: true,
      membershipAmount: 30
    });
  };

  const handleViewUser = async (user: UserProfile) => {
    if (!isAdmin) return;

    // Set user and show modal immediately
    setSelectedUser(user);
    setEditingUser({
      fullName: user.fullName || '',
      password: '',
      email: user.email || '',
      membershipCategory: user.membershipCategory,
      careerPath: user.careerPath,
      role: user.role,
      communityLink: user.communityLink || '',
      mentorAssignments: [],
      status: user.status,
      membershipEnabled: user.membershipEnabled || false,
      membershipAmount: user.membershipAmount || 30
    });
    setShowUserModal(true);

    // Ensure mentors are loaded for the dropdown
    if (availableMentors.length === 0) {
      fetchAvailableMentors();
    }

    // Fetch mentor assignments in background if user is a Mentee
    if (user.role === 'Mentee') {
      setIsLoadingAssignments(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`/api/admin-get-mentor-assignments?menteeId=${user.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const { assignments } = await response.json();
            setEditingUser(prev => ({
              ...prev,
              mentorAssignments: assignments || []
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching mentor assignments:', error);
        setToast({
          message: 'Failed to load mentor assignments',
          type: 'error'
        });
      } finally {
        setIsLoadingAssignments(false);
      }
    }
  };

  const handleCreateUser = async () => {
    if (!isAdmin || isCreating) return;

    try {
      if (!newUser.fullName || !newUser.email || !newUser.membershipCategory || !newUser.role) {
        setToast({
          message: 'Please fill in all required fields.',
          type: 'error'
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        setToast({
          message: 'Please enter a valid email address.',
          type: 'error'
        });
        return;
      }

      const generatedPassword = newUser.password || generatePassword();

      if (generatedPassword.length < 8) {
        setToast({
          message: 'Password must be at least 8 characters long.',
          type: 'error'
        });
        return;
      }

      setIsCreating(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin-create-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: newUser.fullName,
          email: newUser.email,
          password: generatedPassword,
          membershipCategory: newUser.membershipCategory,
          careerPath: newUser.careerPath || null,
          role: newUser.role,
          status: newUser.status,
          membershipEnabled: newUser.membershipEnabled,
          membershipAmount: newUser.membershipAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setToast({
        message: `User created successfully! Temporary password: ${generatedPassword}`,
        type: 'success'
      });

      resetCreateUserForm();
      setShowCreateModal(false);

      fetchUsers();
      fetchStats();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setToast({
        message: error.message || 'Failed to create user. Please try again.',
        type: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!isAdmin || !selectedUser || isUpdating) return;

    try {
      if (!editingUser.fullName || !editingUser.email || !editingUser.membershipCategory || !editingUser.role) {
        setToast({
          message: 'Please fill in all required fields.',
          type: 'error'
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingUser.email)) {
        setToast({
          message: 'Please enter a valid email address.',
          type: 'error'
        });
        return;
      }

      if (editingUser.password && editingUser.password.length < 8) {
        setToast({
          message: 'Password must be at least 8 characters long.',
          type: 'error'
        });
        return;
      }

      setIsUpdating(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update user profile via Netlify function
      const response = await fetch('/api/admin-update-user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          fullName: editingUser.fullName,
          email: editingUser.email,
          password: editingUser.password || undefined,
          membershipCategory: editingUser.membershipCategory,
          careerPath: editingUser.careerPath,
          role: editingUser.role,
          status: editingUser.status,
          communityLink: editingUser.communityLink,
          membershipEnabled: editingUser.membershipEnabled,
          membershipAmount: editingUser.membershipAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      // Handle mentor assignments for mentees
      if (editingUser.role === 'Mentee') {
        const assignmentResponse = await fetch('/api/admin-update-mentor-assignments', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            menteeId: selectedUser.id,
            assignments: editingUser.mentorAssignments
          })
        });

        if (!assignmentResponse.ok) {
          const assignmentError = await assignmentResponse.json();
          console.error('Error updating mentor assignments:', assignmentError);
          // Don't throw error for mentor assignment update failure
        }
      }

      setToast({
        message: 'User updated successfully!',
        type: 'success'
      });

      setShowUserModal(false);
      fetchUsers();
      fetchStats();
      fetchAvailableMentors();
    } catch (error: any) {
      console.error('Error updating user:', error);
      setToast({
        message: error.message || 'Failed to update user. Please try again.',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (!isAdmin) return;

    if (user.id === currentUser.id) {
      setToast({
        message: 'You cannot delete yourself',
        type: 'error'
      });
      return;
    }

    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!isAdmin || !userToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin-delete-user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userToDelete.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setToast({
        message: 'User deleted successfully!',
        type: 'success'
      });

      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setToast({
        message: error.message || 'Failed to delete user. Please try again.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const addMentorAssignment = () => {
    setEditingUser({
      ...editingUser,
      mentorAssignments: [...editingUser.mentorAssignments, {
        mentor: '',
        mentorName: ''
      }]
    });
  };

  const updateMentorAssignment = (index: number, field: string, value: string) => {
    // Check for duplicate mentor assignment
    if (field === 'mentor' && value) {
      const isDuplicate = editingUser.mentorAssignments.some((assignment, i) =>
        i !== index && assignment.mentor === value
      );

      if (isDuplicate) {
        setToast({
          message: 'This mentor has already been assigned to this mentee',
          type: 'error'
        });
        return;
      }
    }

    const updatedAssignments = editingUser.mentorAssignments.map((assignment, i) => {
      if (i === index) {
        const updated = { ...assignment, [field]: value };

        // Auto-populate mentor name when mentor is selected
        if (field === 'mentor' && value) {
          const selectedMentor = availableMentors.find(m => m.id === value);
          if (selectedMentor) {
            updated.mentorName = selectedMentor.full_name;
          }
        }

        return updated;
      }
      return assignment;
    });
    setEditingUser({ ...editingUser, mentorAssignments: updatedAssignments });
  };

  const removeMentorAssignment = (index: number) => {
    setEditingUser({
      ...editingUser,
      mentorAssignments: editingUser.mentorAssignments.filter((_, i) => i !== index)
    });
  };

  // Handle role change and clear mentor assignments if role is Mentor or Admin
  const handleRoleChange = (newRole: string) => {
    const updatedEditingUser = {
      ...editingUser,
      role: newRole
    };

    // Clear mentor assignments if role is Mentor or Admin
    if (newRole === 'Mentor' || newRole === 'Admin') {
      updatedEditingUser.mentorAssignments = [];
      updatedEditingUser.membershipEnabled = false;
    }

    // Fetch mentors if changing to Mentee role and mentors not loaded
    if (newRole === 'Mentee' && availableMentors.length === 0) {
      fetchAvailableMentors();
    }

    setEditingUser(updatedEditingUser);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Mentor':
        return 'bg-blue-100 text-blue-800';
      case 'Mentee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Don't render anything if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 text-center transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">You don't have permission to access this page.</p>
          <Link to="/login" className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <Navigation
        role="Admin"
        userName={currentUser?.fullName || 'Admin'}
        onLogout={() => {
          signOut();
          navigate('/admin/login');
        }}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">User Management</h1>
            <p className="text-gray-600 dark:text-gray-300 transition-colors">Manage users, roles, and membership approvals</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#008080] dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <StatsSkeletonLoader />
        ) : (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-[#008080] dark:text-teal-400 transition-colors" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.approved}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400 transition-colors" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 transition-colors" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 transition-colors">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Mentor">Mentor</option>
              <option value="Mentee">Mentee</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 overflow-hidden mb-8 transition-colors">
          {isLoadingUsers ? (
            <div className="p-8">
              <TableSkeletonLoader />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 transition-colors">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Career Path</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 transition-colors">
                  {users.map((user) => (
                    <tr key={user.id} onClick={() => handleViewUser(user)} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center transition-colors">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{user.fullName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)} transition-colors`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 transition-colors">
                        {user.membershipCategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)} transition-colors`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 transition-colors">
                        {user.careerPath}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.membershipEnabled ? (
                          user.membershipPaid ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 transition-colors">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 transition-colors">
                              <XCircle className="w-3 h-3 mr-1" />
                              Unpaid
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 transition-colors">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors"
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.id === currentUser.id}
                            className={`${
                              user.id === currentUser.id
                                ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                : 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer'
                            } transition-colors`}
                            title={user.id === currentUser.id ? 'Cannot delete yourself' : 'Delete user'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoadingUsers && totalPages > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mt-8 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                Showing <span className="font-semibold text-gray-900 dark:text-white transition-colors">{((currentPage - 1) * usersPerPage) + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white transition-colors">{Math.min(currentPage * usersPerPage, totalUsers)}</span> of <span className="font-semibold text-gray-900 dark:text-white transition-colors">{totalUsers}</span> users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
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
                            ? 'bg-[#008080] dark:bg-teal-600 text-white shadow-md'
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
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-gray-700 dark:text-gray-300"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/30 dark:bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn transition-colors">
         <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl dark:shadow-gray-900/50 animate-slideUp transition-colors">
           <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">User Details & Management</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
           <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* User Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Personal Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Full Name</label>
                      <input
                        type="text"
                        value={editingUser.fullName}
                        onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Email</label>
                     <input
                       type="email"
                       value={editingUser.email}
                       onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                       className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                     />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Membership Category</label>
                      <select
                        value={editingUser.membershipCategory}
                        onChange={(e) => setEditingUser({...editingUser, membershipCategory: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      >
                        <option value="Student">Student</option>
                        <option value="Professional">Professional</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Career Path</label>
                      <select
                        value={editingUser.careerPath}
                        onChange={(e) => setEditingUser({...editingUser, careerPath: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      >
                        {courseOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Mentor">Mentor</option>
                        <option value="Mentee">Mentee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Password</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingUser.password}
                          onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                          className="flex-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                          placeholder="Leave empty to keep current password"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingUser({...editingUser, password: generatePassword()})}
                          className="px-3 py-2 bg-gray-500 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Account Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Status</label>
                      <select
                        value={editingUser.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setEditingUser({
                            ...editingUser,
                            status: newStatus,
                            membershipEnabled: newStatus === 'approved' && (editingUser.role === 'Mentee' || editingUser.role === 'Mentor') ? true : editingUser.membershipEnabled
                          });
                        }}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Slack Community Link</label>
                      <input
                        type="url"
                        value={editingUser.communityLink}
                        onChange={(e) => setEditingUser({...editingUser, communityLink: e.target.value})}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                        placeholder="https://slack.com/..."
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Contract Document</h3>
                  {selectedUser.contractFileUrl ? (
                    <div className="border border-teal-100 bg-teal-50/50 rounded-lg p-4 hover:bg-teal-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg">
                            <FileText className="w-5 h-5 text-[#008080]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Membership Contract</p>
                            <p className="text-xs text-gray-500">PDF Document</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadContract(selectedUser.id, selectedUser.fullName)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium">Download</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">No contract uploaded</p>
                          <p className="text-xs text-gray-400">Contract document not available</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {(selectedUser.role === 'Mentee' || selectedUser.role === 'Mentor') && selectedUser.membershipEnabled && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-100">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                        <div className="flex items-center gap-2">
                          {selectedUser.membershipPaid ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">Paid</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-semibold text-yellow-700">Unpaid</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                        <p className="text-sm font-semibold text-gray-900">GHS {selectedUser.membershipAmount || 30}</p>
                      </div>
                      {selectedUser.membershipPaid && selectedUser.paymentReference && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Reference</label>
                            <p className="text-sm font-mono text-gray-900">{selectedUser.paymentReference}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
                            <p className="text-sm text-gray-900">
                              {selectedUser.paymentDate ? new Date(selectedUser.paymentDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Management Fields */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Settings</h3>

                {/* Membership Settings - Only show for Mentees and Mentors */}
                {(editingUser.role === 'Mentee' || editingUser.role === 'Mentor') && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      {editingUser.role === 'Mentor' ? 'Mentor Membership Settings' : 'Membership Settings'}
                    </h4>
                    
                    {/* Membership Toggle */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Enable {editingUser.role === 'Mentor' ? 'Mentor' : 'Membership'} Payment
                        </label>
                        <p className="text-xs text-gray-500">
                          When enabled, {editingUser.role === 'Mentor' ? 'mentor' : 'user'} must pay before accessing dashboard
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          When disabled, {editingUser.role === 'Mentor' ? 'mentor' : 'user'} can access dashboard without payment requirement
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingUser.membershipEnabled}
                          onChange={(e) => setEditingUser({...editingUser, membershipEnabled: e.target.checked})}
                          className="sr-only peer"
                          disabled={editingUser.status !== 'approved'}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#008080]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                      </label>
                    </div>

                    {/* Membership Amount */}
                    {editingUser.membershipEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {editingUser.role === 'Mentor' ? 'Mentor' : 'Membership'} Amount (GHS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingUser.membershipAmount}
                          onChange={(e) => {
                            const amount = Math.max(0, parseFloat(e.target.value) || 0);
                            setEditingUser({...editingUser, membershipAmount: amount});
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                          placeholder={editingUser.role === 'Mentor' ? '50.00' : '30.00'}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum amount: 0 GHS</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mentor Assignments - Only show for Mentees */}
                {editingUser.role === 'Mentee' && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-semibold text-gray-900">Mentor Assignments</h4>
                    <button
                      onClick={addMentorAssignment}
                      disabled={isLoadingAssignments}
                      className={`px-3 py-1 rounded-lg transition-colors text-sm flex items-center gap-1 ${
                        isLoadingAssignments
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#008080] hover:bg-teal-700 cursor-pointer'
                      } text-white`}
                    >
                      <Plus className="w-3 h-3" />
                      Assign Mentor
                    </button>
                  </div>

                  {isLoadingAssignments ? (
                    <div className="border border-gray-200 rounded-lg p-8 mb-3">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <svg className="animate-spin h-8 w-8 text-[#008080]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-gray-600">Loading mentor assignments...</p>
                      </div>
                    </div>
                  ) : editingUser.mentorAssignments.length === 0 ? (
                    <div className="border border-gray-200 rounded-lg p-6 mb-3 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No mentors assigned yet</p>
                      <p className="text-xs text-gray-500 mt-1">Click "Assign Mentor" to add a mentor</p>
                    </div>
                  ) : (
                    editingUser.mentorAssignments.map((assignment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium text-gray-900">Assignment {index + 1}</h5>
                        <button
                          onClick={() => removeMentorAssignment(index)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-1 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Mentor</label>
                          <select
                            value={assignment.mentor}
                            onChange={(e) => updateMentorAssignment(index, 'mentor', e.target.value)}
                            disabled={isLoadingMentors || availableMentors.length === 0}
                            className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm ${
                              isLoadingMentors || availableMentors.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">
                              {isLoadingMentors
                                ? 'Loading mentors...'
                                : availableMentors.length === 0
                                  ? 'No approved mentors available'
                                  : 'Select mentor'}
                            </option>
                            {availableMentors
                              .filter(mentor => {
                                // Show the currently selected mentor or mentors not yet assigned
                                const isCurrentSelection = assignment.mentor === mentor.id;
                                const isAlreadyAssigned = editingUser.mentorAssignments.some(
                                  (a, i) => i !== index && a.mentor === mentor.id
                                );
                                return isCurrentSelection || !isAlreadyAssigned;
                              })
                              .map(mentor => (
                                <option key={mentor.id} value={mentor.id}>
                                  {mentor.full_name} - {mentor.specialization}
                                </option>
                              ))}
                          </select>
                          {isLoadingMentors && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3 text-[#008080]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading available mentors...
                            </p>
                          )}
                          {!isLoadingMentors && availableMentors.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              No approved mentors in the system. Please approve mentors first.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
                )}
              </div>

              {/* Action Buttons */}
             <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3 flex-shrink-0">
                <button
                  onClick={() => setShowUserModal(false)}
                  disabled={isUpdating}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={isUpdating || isLoadingAssignments}
                  className={`px-4 py-2 bg-[#008080] text-white rounded-lg transition-colors flex items-center gap-2 ${
                    isUpdating || isLoadingAssignments ? 'opacity-75 cursor-not-allowed' : 'hover:bg-teal-700 cursor-pointer'
                  }`}
                  title={isLoadingAssignments ? 'Please wait for mentor assignments to load' : ''}
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : isLoadingAssignments ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
         <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-slideUp">
           <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                <button
                  onClick={() => {
                    resetCreateUserForm();
                    setShowCreateModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
           <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.membershipCategory}
                    onChange={(e) => setNewUser({...newUser, membershipCategory: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Mentee">Mentee</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Career Path</label>
                  <select
                    value={newUser.careerPath}
                    onChange={(e) => setNewUser({...newUser, careerPath: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  >
                    <option value="">Select career path</option>
                    {courseOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    placeholder="Click Generate or enter password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setNewUser({...newUser, password: generatePassword()})}
                    className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              {/* Membership Settings - Only show for Mentees and Mentors */}
              {(newUser.role === 'Mentee' || newUser.role === 'Mentor') && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    {newUser.role === 'Mentor' ? 'Mentor Membership Settings' : 'Membership Settings'}
                  </h4>
                  
                  {/* Membership Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Enable {newUser.role === 'Mentor' ? 'Mentor' : 'Membership'} Payment
                      </label>
                      <p className="text-xs text-gray-500">
                        When enabled, {newUser.role === 'Mentor' ? 'mentor' : 'user'} must pay before accessing dashboard
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        When disabled, {newUser.role === 'Mentor' ? 'mentor' : 'user'} can access dashboard without payment requirement
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUser.membershipEnabled}
                        onChange={(e) => setNewUser({...newUser, membershipEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#008080]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008080]"></div>
                    </label>
                  </div>

                  {/* Membership Amount */}
                  {newUser.membershipEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {newUser.role === 'Mentor' ? 'Mentor' : 'Membership'} Amount (GHS)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newUser.membershipAmount}
                        onChange={(e) => {
                          const amount = Math.max(0, parseFloat(e.target.value) || 0);
                          setNewUser({...newUser, membershipAmount: amount});
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                        placeholder={newUser.role === 'Mentor' ? '50.00' : '30.00'}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum amount: 0 GHS</p>
                    </div>
                  )}
                </div>
              )}

             <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3 flex-shrink-0">
                <button
                  onClick={() => {
                    resetCreateUserForm();
                    setShowCreateModal(false);
                  }}
                  disabled={isCreating}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors ${
                    isCreating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={isCreating}
                  className={`px-4 py-2 bg-[#008080] text-white rounded-lg transition-colors flex items-center gap-2 ${
                    isCreating ? 'opacity-75 cursor-not-allowed' : 'hover:bg-teal-700 cursor-pointer'
                  }`}
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">You are about to delete:</p>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userToDelete.full_name}</p>
                    <p className="text-sm text-gray-500">{userToDelete.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 ${
                    isDeleting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-red-700 cursor-pointer'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

export default AdminDashboard;