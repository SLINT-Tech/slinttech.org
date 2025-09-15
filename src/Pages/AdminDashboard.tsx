import { Calendar, CheckCircle, Download, Edit, Eye, FileText, Mail, MessageSquare, Plus, Search, Trash2, User, Users, X, XCircle } from 'lucide-react';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Toast from '../Components/Toast';

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  membership_category: 'Student' | 'Professional' | 'Volunteer';
  career_path: string;
  role: 'Admin' | 'Mentor' | 'Mentee';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  specialization?: string;
  contract_file_url?: string;
  membership_enabled: boolean;
  membership_amount: number;
  membership_paid: boolean;
  payment_reference?: string;
  payment_date?: string;
  discord_link?: string;
  created_at: string;
  updated_at: string;
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [availableMentors, setAvailableMentors] = useState<MentorOption[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const usersPerPage = 10;

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
    membershipEnabled: false,
    membershipAmount: 30
  });

  const [editingUser, setEditingUser] = useState({
    password: '',
    email: '',
    membershipCategory: '',
    careerPath: '',
    role: '',
    discordLink: '',
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
    
    fetchUsers();
    fetchStats();
    fetchAvailableMentors();
  }, [currentPage, searchTerm, filterStatus, filterRole, isAdmin]);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setIsLoadingUsers(true);
      // First, get user profiles with pagination and filters
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });
        query = query.ilike('full_name', `%${search}%`);
      }

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      // Apply role filter
      if (filterRole !== 'all') {
        query = query.eq('role', filterRole);
      }

      // Apply pagination
      const from = (currentPage - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      query = query.range(from, to);

      // Order by created_at desc
      const { data, error, count } = await query
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setToast({
          message: 'Failed to fetch users. Please try again.',
          type: 'error'
        });
        return;
      }

      // Get user emails from auth.users for each profile
      const userIds = profiles?.map(profile => profile.id) || [];
      
      if (userIds.length > 0) {
        // Fetch emails from auth.users using the admin client
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching auth users:', authError);
          // Continue without emails if auth fetch fails
        }
        
        // Combine profile data with email data
        const usersWithEmails = profiles?.map(profile => {
          const authUser = authUsers?.users?.find(user => user.id === profile.id);
          return {
            ...profile,
            email: authUser?.email || 'N/A'
          };
        }) || [];
        
        setUsers(usersWithEmails);
      } else {
        setUsers([]);
      }
      
      setTotalUsers(count || 0);
      setTotalPages(Math.ceil((count || 0) / usersPerPage));
    } catch (error) {
      console.error('Error fetching users:', error);
      setToast({
        message: 'Failed to fetch users. Please try again.',
        type: 'error'
      });
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setIsLoadingUsers(false);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('status');

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      const statsData = data?.reduce((acc, user) => {
        acc.total++;
        acc[user.status]++;
        return acc;
      }, { total: 0, approved: 0, pending: 0, rejected: 0, suspended: 0 }) || {
        total: 0, approved: 0, pending: 0, rejected: 0
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAvailableMentors = async () => {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, specialization, career_path')
        .eq('role', 'Mentor')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching mentors:', error);
        return;
      }

      const mentors = data?.map(mentor => ({
        id: mentor.id,
        full_name: mentor.full_name,
        specialization: mentor.specialization || mentor.career_path
      })) || [];

      setAvailableMentors(mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
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

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleViewUser = async (user: UserProfile) => {
    if (!isAdmin) return;
    
    setSelectedUser(user);
    
    // Fetch existing mentor assignments for this user
    let existingAssignments = [];
    if (user.role === 'Mentee') {
      try {
        const { data: relationships, error } = await supabase
          .from('mentor_mentee_relationships')
          .select(`
            id,
            mentor_id,
            course_name,
            user_profiles!mentor_id(full_name, specialization, career_path)
          `)
          .eq('mentee_id', user.id);

        if (!error && relationships) {
          existingAssignments = relationships.map(rel => ({
            id: rel.id,
            mentor: rel.mentor_id,
            courseName: rel.course_name,
            mentorName: rel.user_profiles?.full_name || 'Unknown Mentor'
          }));
        }
      } catch (error) {
        console.error('Error fetching mentor assignments:', error);
      }
    }

    setEditingUser({
      password: generatePassword(),
      email: user.email || '',
      membershipCategory: user.membership_category,
      careerPath: user.career_path,
      role: user.role,
      discordLink: user.discord_link || '',
      mentorAssignments: existingAssignments,
      status: user.status,
      membershipEnabled: user.membership_enabled || false,
      membershipAmount: user.membership_amount || 30
    });
    setShowUserModal(true);
  };

  const handleCreateUser = async () => {
    if (!isAdmin) return;
    
    if (!newUser.fullName || !newUser.email || !newUser.membershipCategory || !newUser.role) {
      setToast({
        message: 'Please fill in all required fields.',
        type: 'error'
      });
      return;
    }

    if (newUser.role === 'Mentee' && !newUser.careerPath) {
      setToast({
        message: 'Career path is required for mentees.',
        type: 'error'
      });
      return;
    }

    try {
      const generatedPassword = newUser.password || generatePassword();

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: generatedPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: newUser.fullName
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            full_name: newUser.fullName,
            membership_category: newUser.membershipCategory,
            career_path: newUser.careerPath,
            role: newUser.role,
            status: newUser.status,
            specialization: newUser.role === 'Mentor' ? newUser.careerPath : null,
            membership_enabled: newUser.role === 'Mentee' ? newUser.membershipEnabled : false,
            membership_amount: newUser.membershipAmount,
            membership_paid: false
          });

        if (profileError) {
          throw profileError;
        }

        setToast({
          message: `User created successfully! Password: ${generatedPassword}`,
          type: 'success'
        });

        // Reset form
        setNewUser({
          fullName: '',
          email: '',
          membershipCategory: '',
          careerPath: '',
          role: '',
          status: 'pending',
          password: '',
          membershipEnabled: false,
          membershipAmount: 30
        });
        setShowCreateModal(false);
        
        // Refresh users list
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setToast({
        message: error.message || 'Failed to create user. Please try again.',
        type: 'error'
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!isAdmin || !selectedUser) return;

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          membership_category: editingUser.membershipCategory,
          career_path: editingUser.careerPath,
          role: editingUser.role,
          status: editingUser.status,
          discord_link: editingUser.discordLink,
          membership_enabled: editingUser.membershipEnabled,
          membership_amount: editingUser.membershipAmount,
          specialization: editingUser.role === 'Mentor' ? editingUser.careerPath : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (profileError) {
        throw profileError;
      }

      // Update email if changed
      if (editingUser.email !== selectedUser.email) {
        const { error: emailError } = await supabase.auth.admin.updateUserById(
          selectedUser.id,
          { email: editingUser.email }
        );

        if (emailError) {
          console.error('Error updating email:', emailError);
          // Don't throw error for email update failure
        }
      }

      // Update password if provided
      if (editingUser.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          selectedUser.id,
          { password: editingUser.password }
        );

        if (passwordError) {
          console.error('Error updating password:', passwordError);
          // Don't throw error for password update failure
        }
      }

      // Handle mentor assignments for mentees
      if (editingUser.role === 'Mentee') {
        // Get existing assignments
        const { data: existingAssignments } = await supabase
          .from('mentor_mentee_relationships')
          .select('id, mentor_id, course_name')
          .eq('mentee_id', selectedUser.id);

        const existingIds = existingAssignments?.map(a => a.id) || [];
        const newAssignmentIds = editingUser.mentorAssignments
          .filter(a => a.id)
          .map(a => a.id);

        // Remove deleted assignments
        const toDelete = existingIds.filter(id => !newAssignmentIds.includes(id));
        if (toDelete.length > 0) {
          await supabase
            .from('mentor_mentee_relationships')
            .delete()
            .in('id', toDelete);
        }

        // Add new assignments
        const newAssignments = editingUser.mentorAssignments.filter(a => !a.id);
        if (newAssignments.length > 0) {
          const assignmentsToInsert = newAssignments.map(assignment => ({
            mentor_id: assignment.mentor,
            mentee_id: selectedUser.id,
            course_name: assignment.courseName || 'General Mentorship',
            status: 'active',
            progress_percentage: 0
          }));

          await supabase
            .from('mentor_mentee_relationships')
            .insert(assignmentsToInsert);
        }

        // Update existing assignments
        for (const assignment of editingUser.mentorAssignments.filter(a => a.id)) {
          await supabase
            .from('mentor_mentee_relationships')
            .update({
              mentor_id: assignment.mentor,
              course_name: assignment.courseName || 'General Mentorship'
            })
            .eq('id', assignment.id);
        }
      }

      setToast({
        message: 'User updated successfully!',
        type: 'success'
      });

      setShowUserModal(false);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      console.error('Error updating user:', error);
      setToast({
        message: error.message || 'Failed to update user. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (!isAdmin) return;
    
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!isAdmin || !userToDelete) return;

    try {
      // Delete user from Supabase Auth (this will cascade to user_profiles due to foreign key)
      const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id);

      if (authError) {
        throw authError;
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
    }
  };

  const addMentorAssignment = () => {
    setEditingUser({
      ...editingUser,
      mentorAssignments: [...editingUser.mentorAssignments, { 
        mentor: '', 
        courseName: '', 
        mentorName: '' 
      }]
    });
  };

  const updateMentorAssignment = (index: number, field: string, value: string) => {
    const updatedAssignments = editingUser.mentorAssignments.map((assignment, i) => {
      if (i === index) {
        const updated = { ...assignment, [field]: value };
        
        // Auto-populate course name when mentor is selected
        if (field === 'mentor' && value) {
          const selectedMentor = availableMentors.find(m => m.id === value);
          if (selectedMentor) {
            updated.courseName = selectedMentor.specialization;
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
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Link to="/login" className="text-[#008080] hover:text-teal-700 font-medium">
            Back to Login
          </Link>
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
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Admin</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Admin Portal</span>
              <button 
                onClick={signOut}
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4 absolute top-16 left-0 right-0 shadow-lg">
              <div className="flex flex-col space-y-4">
                <div className="px-4 py-2 text-gray-600 border-b border-gray-200">
                  Admin Portal
                </div>
                <Link 
                  to="/admin/dashboard" 
                  className="px-4 py-2 text-gray-700 hover:text-[#008080] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  User Management
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors border-t border-gray-200 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage users, roles, and membership approvals</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#008080]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Mentor">Mentor</option>
              <option value="Mentee">Mentee</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {isLoadingUsers ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Career Path</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.membership_category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.career_path}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-[#008080] hover:text-teal-700 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoadingUsers}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
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
                      disabled={isLoadingUsers}
                      className={`px-3 py-2 rounded-lg cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#008080] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoadingUsers}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
           <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Details & Management</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
           <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* User Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{selectedUser.full_name}</p>
                    </div>
                    <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                     <input
                       type="email"
                       value={editingUser.email}
                       onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                     />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Membership Category</label>
                      <select
                        value={editingUser.membershipCategory}
                        onChange={(e) => setEditingUser({...editingUser, membershipCategory: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      >
                        <option value="Student">Student</option>
                        <option value="Professional">Professional</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Career Path</label>
                      <select
                        value={editingUser.careerPath}
                        onChange={(e) => setEditingUser({...editingUser, careerPath: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      >
                        {courseOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Mentor">Mentor</option>
                        <option value="Mentee">Mentee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingUser.password}
                          onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                          placeholder="Leave empty to keep current password"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingUser({...editingUser, password: generatePassword()})}
                          className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Document</h3>
                  {selectedUser.contract_file_url ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">Contract uploaded</span>
                        </div>
                        <button className="p-3 text-[#008080] hover:text-teal-700 cursor-pointer">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No contract uploaded</p>
                  )}
                </div>
              </div>

              {/* Admin Management Fields */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Management</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Discord Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discord Community Link</label>
                    <input
                      type="url"
                      value={editingUser.discordLink}
                      onChange={(e) => setEditingUser({...editingUser, discordLink: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      placeholder="https://discord.gg/..."
                    />
                  </div>
                </div>

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
                      className="px-3 py-1 rounded-lg transition-colors text-sm flex items-center gap-1 bg-[#008080] text-white hover:bg-teal-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Assign Mentor
                    </button>
                  </div>
                  
                  {editingUser.mentorAssignments.map((assignment, index) => (
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm"
                          >
                            <option value="">Select mentor</option>
                            {availableMentors.map(mentor => (
                              <option key={mentor.id} value={mentor.id}>
                                {mentor.full_name} - {mentor.specialization}
                              </option>
                            ))}
                          </select>
                        </div>
                        {assignment.mentor && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                            <input
                              type="text"
                              value={assignment.courseName}
                              onChange={(e) => updateMentorAssignment(index, 'courseName', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm"
                              placeholder="Course name"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              {/* Action Buttons */}
             <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3 flex-shrink-0">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
           <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
           <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Membership Category</label>
                  <select
                    value={newUser.membershipCategory}
                    onChange={(e) => setNewUser({...newUser, membershipCategory: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                  >
                    <option value="">Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Mentee">Mentee</option>
                  </select>
                </div>
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                    placeholder="Auto-generated password"
                  />
                  <button
                    type="button"
                    onClick={() => setNewUser({...newUser, password: generatePassword()})}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Create User
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete User
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