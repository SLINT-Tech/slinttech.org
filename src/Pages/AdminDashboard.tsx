import { Calendar, CheckCircle, Download, Edit, Eye, FileText, Mail, MessageSquare, Plus, Search, Trash2, User, Users, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockUsers = [
  {
    id: 1,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    membershipCategory: 'Student',
    careerPath: 'Full Stack Development',
    role: 'Mentee',
    status: 'pending',
    contractFile: 'john_doe_contract.pdf',
    assignedMentor: null,
    discordLink: null,
    courses: [],
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    membershipCategory: 'Professional',
    careerPath: 'UI/UX Design',
    role: 'Mentor',
    status: 'approved',
    contractFile: 'jane_smith_contract.pdf',
    assignedMentor: null,
    discordLink: 'https://discord.gg/slinttech',
    courses: [],
    createdAt: '2024-01-10'
  }
];

const courseOptions = [
  'Full Stack Development',
  'Front-End Development',
  'Back-End Development',
  'Mobile Development',
  'Machine Learning/Artificial Intelligence',
  'Data Science',
  'UI/UX Design'
];

const AdminDashboard = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    membershipCategory: '',
    careerPath: '',
    role: '',
    status: 'pending'
  });

  const [editingUser, setEditingUser] = useState({
    assignedMentorName: '',
    assignedMentorEmail: '',
    discordLink: '',
    courses: [],
    status: 'pending'
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (status) => {
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

  const getRoleColor = (role) => {
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

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setEditingUser({
     email: user.email,
     membershipCategory: user.membershipCategory,
     careerPath: user.careerPath,
     role: user.role,
      assignedMentorName: user.assignedMentor?.name || '',
      assignedMentorEmail: user.assignedMentor?.email || '',
      discordLink: user.discordLink || '',
      courses: user.courses || [],
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    const user = {
      id: users.length + 1,
      ...newUser,
      contractFile: null,
      assignedMentor: null,
      discordLink: null,
      courses: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, user]);
    setNewUser({
      fullName: '',
      email: '',
      membershipCategory: '',
      careerPath: '',
      role: '',
      status: 'pending'
    });
    setShowCreateModal(false);
  };

  const handleUpdateUser = () => {
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
         email: editingUser.email,
         membershipCategory: editingUser.membershipCategory,
         careerPath: editingUser.careerPath,
         role: editingUser.role,
          assignedMentor: editingUser.assignedMentorName ? {
            name: editingUser.assignedMentorName,
            email: editingUser.assignedMentorEmail
          } : null,
          discordLink: editingUser.discordLink,
          courses: editingUser.courses,
          status: editingUser.status
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    setShowUserModal(false);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const addCourse = () => {
    setEditingUser({
      ...editingUser,
      courses: [...editingUser.courses, { title: '', link: '', duration: '' }]
    });
  };

  const updateCourse = (index, field, value) => {
    const updatedCourses = editingUser.courses.map((course, i) => {
      if (i === index) {
        return { ...course, [field]: value };
      }
      return course;
    });
    setEditingUser({ ...editingUser, courses: updatedCourses });
  };

  const removeCourse = (index) => {
    setEditingUser({
      ...editingUser,
      courses: editingUser.courses.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900">SlintTech Admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Admin Portal</span>
              <Link 
                to="/admin/login" 
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
              >
                Logout
              </Link>
            </div>
          </div>
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
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'rejected').length}
                </p>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
              onChange={(e) => setFilterRole(e.target.value)}
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
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
                      {user.membershipCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.careerPath}
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
                          onClick={() => handleDeleteUser(user.id)}
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
        </div>
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
                      <p className="text-gray-900">{selectedUser.fullName}</p>
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
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Mentor">Mentor</option>
                        <option value="Mentee">Mentee</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Document</h3>
                  {selectedUser.contractFile ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{selectedUser.contractFile}</span>
                        </div>
                        <button className="text-[#008080] hover:text-teal-700 cursor-pointer">
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
                      onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
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

                {/* Assigned Mentor */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Assigned Mentor</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Name</label>
                      <input
                        type="text"
                        value={editingUser.assignedMentorName}
                        onChange={(e) => setEditingUser({...editingUser, assignedMentorName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                        placeholder="Enter mentor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Email</label>
                      <input
                        type="email"
                        value={editingUser.assignedMentorEmail}
                        onChange={(e) => setEditingUser({...editingUser, assignedMentorEmail: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                        placeholder="Enter mentor email"
                      />
                    </div>
                  </div>
                </div>

                {/* Course Timeline */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-semibold text-gray-900">Course Timeline</h4>
                    <button
                      onClick={addCourse}
                      className="bg-[#008080] text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add Course
                    </button>
                  </div>
                  
                  {editingUser.courses.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-medium text-gray-900">Course {index + 1}</h5>
                        <button
                          onClick={() => removeCourse(index)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                          <select
                            value={course.title}
                            onChange={(e) => updateCourse(index, 'title', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm"
                          >
                            <option value="">Select course</option>
                            {courseOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={course.duration}
                            onChange={(e) => updateCourse(index, 'duration', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm"
                            placeholder="e.g., 8 weeks"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">External Link</label>
                          <input
                            type="url"
                            value={course.link}
                            onChange={(e) => updateCourse(index, 'link', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none text-sm"
                            placeholder="https://codecademy.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <p className="font-medium text-gray-900">{userToDelete.fullName}</p>
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
    </div>
  );
};

export default AdminDashboard;