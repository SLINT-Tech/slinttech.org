import { ArrowLeft, CheckCircle, Download, Eye, EyeOff, FileText, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Toast from '../Components/Toast';
import Navigation from '../Components/Navigation';
import { apiGet, apiPost, apiDownload, saveBlob } from '../lib/api';

const MentorProfilePage = () => {
  const { signOut } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

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
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/mentor/login');
          return;
        }

        let profile;
        try {
          const data = await apiGet('/auth/me');
          profile = data.profile;
        } catch (error) {
          console.error('Error fetching profile', error);
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
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName || profile.full_name,
          membershipCategory: profile.membershipCategory || profile.membership_category,
          careerPath: profile.careerPath || profile.career_path,
          role: profile.role,
          status: profile.status,
          specialization: profile.specialization,
          membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
          membershipAmount: profile.membershipAmount || profile.membership_amount,
          membershipPaid: profile.membershipPaid || profile.membership_paid,
          paymentReference: profile.paymentReference || profile.payment_reference,
          paymentDate: profile.paymentDate || profile.payment_date,
          contractFileUrl: profile.contractFileUrl || profile.contract_file_url
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));

        setProfileData({
          fullName: profile.fullName || profile.full_name,
          email: profile.email,
          specialization: profile.specialization,
          contractFile: profile.contractFileUrl || profile.contract_file_url,
          joinedDate: profile.createdAt || profile.created_at,
          status: profile.status,
          membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
          membershipAmount: profile.membershipAmount || profile.membership_amount,
          membershipPaid: profile.membershipPaid || profile.membership_paid,
          paymentDate: profile.paymentDate || profile.payment_date,
          paymentReference: profile.paymentReference || profile.payment_reference
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
      setToast({
        message: 'New passwords do not match!',
        type: 'error'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setToast({
        message: 'Password must be at least 8 characters long!',
        type: 'error'
      });
      return;
    }

    setIsUpdating(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setToast({
          message: 'Authentication required',
          type: 'error'
        });
        setIsUpdating(false);
        return;
      }

      await apiPost('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setToast({
        message: 'Password updated successfully!',
        type: 'success'
      });

      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password update error:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to update password',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadContract = async () => {
    try {
      const contractUrl = profileData?.contractFile;

      if (!contractUrl) {
        setToast({
          message: 'No contract document available',
          type: 'error'
        });
        return;
      }

      const token = localStorage.getItem('token');
      const userId = currentUser.id;

      if (!token || !userId) {
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

      const { blob, fileName } = await apiDownload('/download-contract', { userId });

      saveBlob(
        blob,
        fileName || `${profileData.fullName.replace(/[^a-zA-Z0-9 ]/g, '_').trim()}_contract.pdf`
      );

      setToast({
        message: 'Contract downloaded successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Download error:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to download contract',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
        <Navigation
          role="Mentor"
          userName={currentUser.fullName || 'Mentor'}
          onLogout={() => {
            signOut();
            navigate('/mentor/login');
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/mentor/dashboard')}
            className="flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* Profile Header Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 transition-colors">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-4 animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Personal Information Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse"></div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Documents Skeleton */}
            <div className="space-y-6">
              {/* Password Update Skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>

                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto animate-pulse"></div>
                </div>
              </div>

              {/* Contract Document Skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mr-3 animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
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
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
        {/* Header */}
        <header className="bg-white/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-2xl transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                <span className="text-xl text-[#008080] dark:text-[#008080] hidden md:block">
                  <span className="font-bold">SLINT</span><span className="ml-[1.5px]">Tech</span>
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/mentor/dashboard')}
                  className="flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
                <Link
                  to="/mentor/login"
                  className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer transition-colors"
                >
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Error State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 text-center transition-colors">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Profile</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please try refreshing the page or contact support.</p>
            <Link to="/mentor/dashboard" className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <Navigation
        role="Mentor"
        userName={profileData?.fullName || currentUser.fullName || 'Mentor'}
        onLogout={() => {
          signOut();
          navigate('/mentor/login');
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/mentor/dashboard')}
          className="flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-8 transition-colors">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center mr-4 transition-colors">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-300">{profileData.specialization}</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(profileData.status)} mt-2 transition-colors`}>
                {profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors">
                  <p className="text-gray-900 dark:text-white">{profileData.fullName}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors">
                  <p className="text-gray-900 dark:text-white">{profileData.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Specialization</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors">
                  <p className="text-gray-900 dark:text-white">{profileData.specialization}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Joined Date</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg transition-colors">
                  <p className="text-gray-900 dark:text-white">{new Date(profileData.joinedDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Membership Payment Section */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Membership Payment</label>
                {profileData.membershipEnabled && profileData.membershipAmount > 0 ? (
                  profileData.membershipPaid ? (
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-green-800 dark:text-green-400 font-medium">₵{profileData.membershipAmount} - Paid</p>
                      </div>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Paid on {new Date(profileData.paymentDate).toLocaleDateString()}
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                        Ref: {profileData.paymentReference}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-colors">
                      <p className="text-yellow-800 dark:text-yellow-400 font-medium">₵{profileData.membershipAmount} - Payment Required</p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">Membership payment pending</p>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">₵0 - No Payment Required</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Membership payment not enabled</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security & Documents */}
          <div className="space-y-6">
            {/* Password Update */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer transition-colors"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm ? (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 pr-10 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 pr-10 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 pr-10 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-[#008080] dark:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                    <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Click "Change Password" to update your password</p>
                </div>
              )}
            </div>

            {/* Contract Document */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 transition-colors">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Membership Agreement</h2>

              {profileData.contractFile ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Membership Contract Document</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed agreement uploaded during registration</p>
                      </div>
                    </div>
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={downloadContract}
                        className="flex items-center gap-2 bg-[#008080] dark:bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download Contract
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No contract document available</p>
                </div>
              )}
            </div>
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

export default MentorProfilePage;