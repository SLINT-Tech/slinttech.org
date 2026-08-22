import { ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../Components/Toast';
import { apiPublicPost, ApiError } from '../lib/api';


const MentorLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (token && currentUser.role) {
      if (currentUser.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (currentUser.role === 'Mentor') {
        if (currentUser.status === 'approved' && currentUser.membershipEnabled && !currentUser.membershipPaid) {
          navigate('/payment-wall');
        } else if (currentUser.status === 'approved' || currentUser.status === 'pending') {
          navigate('/mentor/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let data;
      try {
        data = await apiPublicPost('/mentor/login', {
          email: formData.email.trim(),
          password: formData.password,
        });
      } catch (loginError) {
        const apiError = loginError as ApiError;
        const data = apiError.data || {};
        if (apiError.status === 403 && String(apiError.message).includes('pending approval')) {
          const profile = data.profile;
          const userData = {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName || profile.full_name,
            membershipCategory: profile.membershipCategory || profile.membership_category,
            careerPath: profile.careerPath || profile.career_path,
            role: profile.role,
            status: 'pending',
            specialization: profile.specialization,
            membershipEnabled: profile.membershipEnabled || profile.membership_enabled,
            membershipAmount: profile.membershipAmount || profile.membership_amount,
            membershipPaid: profile.membershipPaid || profile.membership_paid,
          };
          localStorage.setItem('currentUser', JSON.stringify(userData));
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
          navigate('/mentor/dashboard');
          return;
        }
        throw loginError;
      }

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
        paymentDate: profile.paymentDate || profile.payment_date,
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      if (profile.status === 'pending') {
        navigate('/mentor/dashboard');
        return;
      }

      if (profile.status === 'rejected') {
        setToast({
          message: 'Your account has been rejected. Please contact support.',
          type: 'error'
        });
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        return;
      }

      if (profile.status === 'suspended') {
        setToast({
          message: 'Your account has been suspended. Please contact support.',
          type: 'error'
        });
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        return;
      }

      if (data.requiresPayment) {
        navigate('/payment-wall');
        return;
      }

      navigate('/mentor/dashboard');
    } catch (error: any) {
      setToast({
        message: error.message || 'Login failed. Please check your credentials.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <header className="bg-white/95 dark:bg-gray-900/95 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
            </Link>
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 transition-colors">
          <div className="text-center mb-8">
            <img
              src="/assets/logo.svg"
              alt="SlintTech"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mentor <span className="text-[#008080] dark:text-teal-400">Portal</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your SlintTech mentor dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Mentor Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                placeholder="Enter your mentor email address"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 pr-12 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#008080] dark:bg-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Mentor Portal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
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

export default MentorLoginPage;
