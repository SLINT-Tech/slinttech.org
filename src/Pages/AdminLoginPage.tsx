import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../Components/Toast';
import Header from '../Sections/Header';
import { apiPost } from '../lib/api';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success'; } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (token && currentUser.role) {
      if (currentUser.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (currentUser.role === 'Mentor') {
        navigate('/mentor/dashboard');
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
      const response = await apiPost('/admin-login', {
        email: formData.email.trim(),
        password: formData.password,
      }, { skipAuth: true });

      const data = await response.json();

      if (!response.ok) {
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

      navigate('/admin/dashboard');
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
      <Header />

      {/* Main Content */}
      <main id="main" tabIndex={-1} className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 focus:outline-none">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 transition-colors">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/assets/logo.svg"
              alt="SlintTech"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin <span className="text-[#008080] dark:text-teal-400">Portal</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access the SlintTech admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Admin Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors"
                placeholder="Enter your admin email address"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-controls="password"
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#008080] dark:focus-visible:outline-teal-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#008080] text-white font-semibold py-4 px-6 rounded-lg hover:bg-[#006666] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Admin Portal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

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

export default AdminLoginPage;