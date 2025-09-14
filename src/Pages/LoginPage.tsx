import { ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Toast from '../Components/Toast';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { signOut } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const navigate = useNavigate();

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
      // Clear any existing session data first
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          throw new Error('Failed to load user profile');
        }

        // Store user data in localStorage for other components to access
        const userData = {
          id: authData.user.id,
          email: authData.user.email,
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
          paymentDate: profile.payment_date
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Force navigation with window.location as backup
        const navigateToRoute = (route: string) => {
          console.log('Navigating to:', route);
          navigate(route);
          // Backup navigation after a short delay
          setTimeout(() => {
            if (window.location.pathname === '/login') {
              console.log('React Router navigation failed, using window.location');
              window.location.href = route;
            }
          }, 100);
        };
        
        // Route based on user role and status
        if (profile.role === 'Admin') {
          navigateToRoute('/admin/dashboard');
        } else if (profile.role === 'Mentor') {
          if (profile.status === 'approved') {
            if (profile.membership_enabled && !profile.membership_paid) {
              navigateToRoute('/payment-wall');
            } else {
              navigateToRoute('/mentor/dashboard');
            }
          } else {
            navigateToRoute('/mentor/dashboard'); // Preview for pending mentors
          }
        } else { // Mentee
          if (profile.status === 'approved') {
            if (profile.membership_enabled && !profile.membership_paid) {
              navigateToRoute('/payment-wall');
            } else {
              navigateToRoute('/dashboard');
            }
          } else {
            navigateToRoute('/dashboard'); // Preview for pending mentees
          }
        }
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
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
            </Link>
            <Link 
              to="/" 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/assets/education.svg"
              alt="Education"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome <span className="text-[#008080]">Back</span>
            </h1>
            <p className="text-gray-600">
              Sign in to access your SlintTech dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none transition-colors"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-[#008080] text-sm font-medium hover:underline cursor-pointer">
                Forgot your password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#008080] text-white font-semibold py-4 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

          {/* Sign Up Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#008080] font-medium hover:underline cursor-pointer">
                Join our community
              </Link>
            </p>
          </div>
        </div>
      </div>

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

export default LoginPage;