import { ArrowLeft, CheckCircle, Download, Eye, EyeOff, FileText, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock data - this would come from your backend/database
const mockMenteeProfile = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  membershipCategory: 'Student',
  careerPath: 'Full Stack Development',
  contractFile: 'john_doe_contract.pdf',
  joinedDate: '2024-01-15',
  status: 'approved',
  membershipEnabled: true, // Admin can toggle this
  membershipAmount: 30,
  membershipPaid: true,
  paymentDate: '2024-01-20',
  paymentReference: 'slint_1_1705747200000'
};

const MenteeProfilePage = () => {
  const [profileData, setProfileData] = useState(mockMenteeProfile);
  
  // Get current user data from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Use current user data for status display
  const displayStatus = currentUser.status || profileData.status;
  const displayFullName = currentUser.fullName || profileData.fullName;
  const displayEmail = currentUser.email || profileData.email;
  const displayCareerPath = currentUser.careerPath || profileData.careerPath;
  const displayMembershipCategory = currentUser.membershipCategory || profileData.membershipCategory;
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    setIsUpdating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Password update:', passwordData);
    
    setIsUpdating(false);
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    alert('Password updated successfully!');
  };

  const downloadContract = () => {
    const filename = profileData.contractFile;
    const link = document.createElement('a');
    link.href = `/documents/${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate display amount based on membership settings
  const getDisplayAmount = () => {
    if (!profileData.membershipEnabled) {
      return 0;
    }
    return profileData.membershipAmount || 0;
  };

  const displayAmount = getDisplayAmount();

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900">SlintTech</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Profile Settings</span>
              <Link 
                to="/login" 
                className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#008080] hover:text-teal-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayFullName}</h1>
              <p className="text-gray-600">{displayCareerPath}</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(displayStatus)} mt-2`}>
                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{displayFullName}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{displayEmail}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Membership Category</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{displayMembershipCategory}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Career Path</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{displayCareerPath}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Joined Date</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{new Date(profileData.joinedDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Membership Payment Section */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Membership Payment</label>
                {displayAmount > 0 ? (
                  profileData.membershipPaid ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-green-800 font-medium">₵{displayAmount} Paid</p>
                      </div>
                      <p className="text-green-700 text-sm">
                        Paid on {new Date(profileData.paymentDate).toLocaleDateString()}
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        Ref: {profileData.paymentReference}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 font-medium">₵{displayAmount} - Payment Required</p>
                      <p className="text-yellow-700 text-sm">Membership payment pending</p>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 font-medium">₵0 - No Payment Required</p>
                    <p className="text-gray-600 text-sm">Membership payment not enabled</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security & Documents */}
          <div className="space-y-6">
            {/* Password Update */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              
              {showPasswordForm ? (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-[#008080] text-white font-semibold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Click "Change Password" to update your password</p>
                </div>
              )}
            </div>

            {/* Contract Document */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Membership Agreement</h2>
              
              {profileData.contractFile ? (
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center flex-1 min-w-0">
                      <FileText className="w-8 h-8 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Signed Agreement</p>
                        <p className="text-sm text-gray-500 break-all">{profileData.contractFile}</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadContract}
                      className="flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No contract document available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeProfilePage;