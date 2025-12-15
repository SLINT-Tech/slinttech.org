import { ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../Components/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (token && currentUser.role) {
      if (currentUser.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (currentUser.role === 'Mentor') {
        navigate('/mentor/dashboard');
      } else if (currentUser.status === 'approved' && currentUser.membershipEnabled && !currentUser.membershipPaid) {
        navigate('/payment-wall');
      } else if (currentUser.status === 'approved' || currentUser.status === 'pending') {
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
      const response = await fetch(`${API_BASE_URL}/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error.includes('pending approval')) {
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
          navigate('/dashboard');
          return;
        }
        throw new Error(data.error || 'Login failed');
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
        navigate('/dashboard');
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

      if (profile.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (profile.role === 'Mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/dashboard');
      }
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
      <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl backdrop-saturate-150 border-b border-white/20 dark:border-gray-800/50 sticky top-0 z-10 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-0">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="hidden md:inline text-[#008080] dark:text-[#008080] text-xl">
                <span className="font-bold">SLINT</span><span className="ml-[1.5px]">Tech</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="#008080" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 1.414l2.12 2.12a1 1 0 001.414-1.414zM2.05 2.05a1 1 0 011.414 0l2.12 2.12a1 1 0 01-1.414 1.414L1.636 3.464a1 1 0 010-1.414zM17.364 17.364a1 1 0 001.414-1.414l-2.12-2.12a1 1 0 00-1.414 1.414l2.12 2.12z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="#364153" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <Link
                to="/"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/20 dark:border-gray-800/50 p-8 transition-colors">
          <div className="text-center mb-8">
            <img
              src="/assets/logo.svg"
              alt="SlintTech"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome <span className="text-[#008080] dark:text-teal-400">Back</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your SlintTech dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                placeholder="Enter your email address"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a href="#" className="text-[#008080] dark:text-teal-400 text-sm font-medium hover:underline cursor-pointer">
                Forgot your password?
              </a>
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
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-300">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#008080] dark:text-teal-400 font-medium hover:underline cursor-pointer">
                Join our community
              </Link>
            </p>
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

export default LoginPage;
