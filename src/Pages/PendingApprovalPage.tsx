import { Clock, Mail, MessageSquare, LayoutDashboard, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';
import { useEffect, useState } from 'react';
import { PageLoader } from '../Components/SkeletonLoader';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth-me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          logout(navigate, '/login');
          return;
        }

        const data = await response.json();
        const profile = data.profile;

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
          paymentDate: profile.paymentDate || profile.payment_date
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        setCurrentUser(userData);

        if (userData.status !== 'pending') {
          if (userData.status === 'approved') {
            if (userData.membershipEnabled && !userData.membershipPaid) {
              navigate('/payment-wall', { replace: true });
            } else if (userData.role === 'Mentor') {
              navigate('/mentor/dashboard', { replace: true });
            } else if (userData.role === 'Admin') {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } else {
            if (userData.role === 'Mentor') {
              navigate('/mentor/login', { replace: true });
            } else if (userData.role === 'Admin') {
              navigate('/admin/login', { replace: true });
            } else {
              navigate('/login', { replace: true });
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        logout(navigate, '/login');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading || !currentUser) {
    return <PageLoader message="Checking approval status..." />;
  }

  const isMentor = currentUser.role === 'Mentor';

  const handleLogout = () => {
    logout(navigate, '/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-2xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden md:block transition-colors">SlintTech</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 text-center transition-colors">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400 transition-colors" />
          </div>

          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            Account Pending Approval
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg transition-colors">
            Hello <span className="font-semibold text-[#008080] dark:text-teal-400 transition-colors">{currentUser.fullName}</span>!
            Your account is currently under review by our admin team.
          </p>

          {/* Status Card */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8 transition-colors">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mr-4 transition-colors">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 transition-colors">Status: Pending Review</h3>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm transition-colors">We're reviewing your membership application</p>
              </div>
            </div>

            <div className="text-left space-y-3 text-sm text-yellow-700 dark:text-yellow-400 transition-colors">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Application submitted successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                <span>Admin review in progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>You'll receive an email notification once approved</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="text-left mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors">What happens next?</h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p>Our admin team will review your application and contract</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p>You'll receive an email notification with the approval status</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#008080] dark:bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p>
                  {isMentor
                    ? 'Once approved, you can access your mentor dashboard and start teaching'
                    : 'Once approved, you can access your dashboard and start learning'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Preview Dashboard Button */}
          <Link
            to={isMentor ? '/mentor/dashboard' : '/dashboard'}
            className="flex items-center justify-center gap-2 w-full bg-[#008080] dark:bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors font-medium mb-8"
          >
            <LayoutDashboard className="w-5 h-5" />
            Preview Your Dashboard
          </Link>

          {/* Contact Support */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-colors">
            <div className="flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-[#008080] dark:text-teal-400 mr-2 transition-colors" />
              <h4 className="font-semibold text-gray-900 dark:text-white transition-colors">Need Help?</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 transition-colors">
              If you have any questions about your application status, feel free to contact our support team.
            </p>
            <div className="flex items-center justify-center gap-2 text-[#008080] dark:text-teal-400 transition-colors">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@slinttech.org" className="font-medium hover:underline">
                contact@slinttech.org
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;