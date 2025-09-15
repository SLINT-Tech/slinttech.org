import { Calendar, CheckCircle, Download, Edit, Eye, FileText, Mail, MessageSquare, Plus, Search, Trash2, User, Users, X, XCircle } from 'lucide-react';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
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
    
    try {
      setIsLoadingUsers(true);
      
      // Call admin edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'list_users',
          page: currentPage,
          per_page: usersPerPage,
          search: searchTerm || undefined,
          role: filterRole !== 'all' ? filterRole : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const { data, count } = await response.json();
      
      setUsers(data || []);
      setTotalUsers(count || 0);
      setTotalPages(Math.ceil((count || 0) / usersPerPage));
    } catch (error) {
      console.error('Error fetching users:', error);
      setToast({
        message: 'Failed to fetch users. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchStats = async () => {
    if (!isAdmin) return;
    
    try {
      // Call admin edge function for stats
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_user_stats'
        })
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
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
        const { error: profileError } = await supabaseAdmin
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
      const { error: profileError } = await supabaseAdmin
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_user',
          userId: userToDelete.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();