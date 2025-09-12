import { ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock mentor data for testing different states
const mockMentors = [
  {
    id: 1,
    email: 'mentor.pending@example.com',
    password: 'password123',
    fullName: 'Pending Mentor',
    status: 'pending',
    role: 'Mentor',
    specialization: 'Full Stack Development',
    membershipEnabled: false,
    membershipAmount: 50,
    membershipPaid: false
  },
  {
    id: 2,
    email: 'mentor.approved.nopay@example.com',
    password: 'password123',
    fullName: 'Approved Mentor No Payment',
    status: 'approved',
    role: 'Mentor',
    specialization: 'Frontend Development',
    membershipEnabled: false,
    membershipAmount: 50,
    membershipPaid: false
  },
  {
    id: 3,
    email: 'mentor.approved.payment@example.com',
    password: 'password123',
    fullName: 'Approved Mentor With Payment',
    status: 'approved',
    role: 'Mentor',
    specialization: 'Backend Development',
    membershipEnabled: true,
    membershipAmount: 50,
    membershipPaid: false
  }
];

const MentorLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find mentor in mock data
    const mentor = mockMentors.find(m => m.email === formData.email && m.password === formData.password);
    
    setIsSubmitting(false);
    
    if (mentor) {
      // Store mentor data in localStorage for other components to access
      localStorage.setItem('currentUser', JSON.stringify(mentor));
      
      // Check mentor status and membership requirements
      if (mentor.status === 'approved') {
        if (mentor.membershipEnabled && !mentor.membershipPaid) {
          navigate('/payment-wall');
        } else {
          navigate('/mentor/dashboard');
        }
      } else if (mentor.status === 'pending') {
        // Allow limited dashboard preview for pending users
        navigate('/mentor/dashboard');
      } else {
        alert('Your account has been rejected or suspended. Please contact support.');
      }
    } else {
      alert('Invalid email or password. Try: mentor.pending@example.com, mentor.approved.nopay@example.com, or mentor.approved.payment@example.com with password: password123');
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
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
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
              Mentor <span className="text-[#008080]">Portal</span>
            </h1>
            <p className="text-gray-600">
              Sign in to access your SlintTech mentor dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Mentor Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none transition-colors"
                placeholder="Enter your mentor email address"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
                  Sign In to Mentor Portal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorLoginPage;