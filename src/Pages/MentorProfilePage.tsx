import { ArrowLeft, CheckCircle, Download, Eye, EyeOff, FileText, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { downloadContractFile } from '../lib/storage';
import { supabase } from '../lib/supabase';

const MentorProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get current user data from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/mentor/login');
          return;
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setLoading(false);
          return;
        }

        // Verify user is a mentor
        if (profile.role !== 'Mentor') {
          navigate('/mentor/login');
          return;
        }

        // Update localStorage with fresh data
        const userData = {
          id: user.id,
          email: user.email,
          fullName: profile.full_name,
          membershipCategory: profile.membership_category,
          careerPath: profile.career_path,
          role: profile.role,
          status: profile.status,
          specialization: profile.specialization,
          membershipEnabled: profile.membership_enabled,
          membershipAmount: profile.membership_amount,
          membershipPaid: profile.membership_paid,
          paymentReference: profile.payment_reference,
          paymentDate: profile.payment_date,
          contractFileUrl: profile.contract_file_url
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));

        setProfileData({
          fullName: profile.full_name,
          email: user.email,
          specialization: profile.specialization,
          contractFile: profile.contract_file_url,
          joinedDate: profile.created_at,
          status: profile.status,
          membershipEnabled: profile.membership_enabled,
          membershipAmount: profile.membership_amount,
          membershipPaid: profile.membership_paid,
          paymentDate: profile.payment_date,
          paymentReference: profile.payment_reference
        });

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setIsUpdating(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password. Please try again.');
      } else {
        alert('Password updated successfully');
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadContract = async () => {
    try {
      await downloadContractFile(profileData.contractFile);
    } catch (error) {
      console.error('Error downloading contract:', error);
      alert('Failed to download contract file');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'inactive':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        {/* Header */}
        <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="ml-2 text-xl font-bold text-gray-900">SlintTech Mentor</span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Profile Settings</span>
                <Link 
                  to="/mentor/login" 
                  className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
                >
                  Logout
                </Link>
              </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Profile Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Personal Information Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Documents Skeleton */}
            <div className="space-y-6">
              {/* Password Update Skeleton */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
                </div>
              </div>

              {/* Contract Document Skeleton */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-gray-200 rounded mr-3 animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-40 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-56 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        {/* Header */}
        <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech Mentor</span>
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/mentor/dashboard')}
                  className="flex items-center gap-2 text-[#008080] hover:text-teal-700 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
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

        {/* Error State */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Profile</h1>
            <p className="text-gray-600 mb-4">Please try refreshing the page or contact support.</p>
            <Link to="/mentor/dashboard" className="text-[#008080] hover:text-teal-700 cursor-pointer">
              Back to Dashboard
            </Link>
          </div>
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
              <span className="ml-2 text-xl font-bold text-gray-900">SlintTech Mentor</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="flex items-center gap-2 text-[#008080] hover:text-teal-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-[#008080] rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileData.fullName}</h1>
                <p className="text-gray-600">{profileData.specialization}</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(profileData.status)} mt-2`}>
                  {profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1)}
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
                    <p className="text-gray-900">{profileData.fullName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{profileData.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Specialization</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{profileData.specialization}</p>
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
                  {profileData.membershipEnabled && profileData.membershipAmount > 0 ? (
                    profileData.membershipPaid ? (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-green-800 font-medium">₵{profileData.membershipAmount} - Paid</p>
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
                        <p className="text-yellow-800 font-medium">₵{profileData.membershipAmount} - Payment Required</p>
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
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Membership Contract Document</p>
                          <p className="text-sm text-gray-500">Signed agreement uploaded during registration</p>
                        </div>
                      </div>
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={downloadContract}
                          className="flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Download Contract
                        </button>
                      </div>
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

  export default MentorProfilePage;