import { ArrowRight, CheckCircle, Download, FileText, Moon, Sun, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../Components/Toast';
import { uploadContractToCloudinary } from '../lib/cloudinary';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    membershipCategory: '',
    careerPath: '',
    role: 'Mentee' as 'Mentee' | 'Mentor',
    contractFile: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setToast({
          message: 'Invalid file type. Please upload a PDF file only.',
          type: 'error'
        });
        e.target.value = '';
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setToast({
          message: 'File too large. Maximum file size is 10MB.',
          type: 'error'
        });
        e.target.value = '';
        return;
      }

      if (file.size === 0) {
        setToast({
          message: 'Empty file detected. Please select a valid PDF file.',
          type: 'error'
        });
        e.target.value = '';
        return;
      }

      setFormData(prev => ({
        ...prev,
        contractFile: file
      }));

      setToast({
        message: 'Contract file selected successfully!',
        type: 'success'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setToast({
        message: 'Please enter your full name.',
        type: 'error'
      });
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setToast({
        message: 'Full name must be at least 2 characters long.',
        type: 'error'
      });
      return;
    }

    if (!formData.email.trim()) {
      setToast({
        message: 'Please enter your email address.',
        type: 'error'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({
        message: 'Please enter a valid email address.',
        type: 'error'
      });
      return;
    }

    if (formData.password.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters long.',
        type: 'error'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({
        message: 'Passwords do not match. Please check and try again.',
        type: 'error'
      });
      return;
    }

    if (!formData.membershipCategory) {
      setToast({
        message: 'Please select a membership category.',
        type: 'error'
      });
      return;
    }

    if (!formData.careerPath) {
      setToast({
        message: `Please select your ${formData.role === 'Mentor' ? 'specialization' : 'career path'}.`,
        type: 'error'
      });
      return;
    }

    if (!formData.contractFile) {
      setToast({
        message: 'Please upload the signed membership agreement before submitting.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/auth-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim(),
            membershipCategory: formData.membershipCategory,
            careerPath: formData.careerPath,
            role: formData.role,
            specialization: formData.role === 'Mentor' ? formData.careerPath : null
          }),
        });
      } catch (networkError) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid server response. Please try again later.');
      }

      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Registration failed';
        throw new Error(errorMessage);
      }

      if (!data.userId) {
        throw new Error('Account created but user ID was not returned. Please contact support.');
      }

      setToast({
        message: 'Account created! Uploading your contract...',
        type: 'success'
      });

      let uploadResult;
      try {
        uploadResult = await uploadContractToCloudinary(formData.contractFile, data.userId);
      } catch (uploadError: any) {
        console.error('Contract upload error:', uploadError);
        throw new Error('Account created but contract upload failed. Please contact support with your email to complete registration.');
      }

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload contract. Please contact support to complete your registration.');
      }

      try {
        const updateResponse = await fetch(`${API_BASE_URL}/auth-update-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.userId,
            contractFileUrl: uploadResult.url,
          }),
        });

        if (!updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.error('Profile update failed:', updateData);
        }
      } catch (updateError) {
        console.error('Profile update error:', updateError);
      }

      setToast({
        message: 'Registration successful! Your account is under review. You will be notified once approved.',
        type: 'success'
      });

      const userInfo = {
        id: data.userId,
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        membershipCategory: formData.membershipCategory,
        careerPath: formData.careerPath,
        role: formData.role,
        status: 'pending',
        membershipPaid: false,
        contractFileUrl: uploadResult.url,
      };

      localStorage.setItem('currentUser', JSON.stringify(userInfo));

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        membershipCategory: '',
        careerPath: '',
        role: 'Mentee',
        contractFile: null
      });

      const fileInput = document.getElementById('contract-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      setTimeout(() => {
        navigate('/pending-approval');
      }, 2500);
    } catch (error: any) {
      console.error('Signup error:', error);
      setToast({
        message: error.message || 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadContract = () => {
    try {
      // Direct download approach
      const filename = 'slint_tech_membership_agreement_and_contract.pdf';
      const downloadUrl = `/documents/${encodeURIComponent(filename)}`;
      
      // Use window.open for reliable download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      setToast({
        message: 'Failed to download contract. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl backdrop-saturate-150 border-b border-white/20 dark:border-gray-800/50 sticky top-0 z-10 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl backdrop-saturate-150 rounded-xl shadow-lg border border-white/20 dark:border-gray-800/50 p-6 sm:p-8 transition-colors">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/assets/education.svg"
              alt="Education"
              className="w-14 h-14 mx-auto mb-3"
            />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join Our <span className="text-[#008080] dark:text-teal-400">Community</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base max-w-2xl mx-auto">
              Start your journey with SlintTech and connect with mentors who will guide your growth.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two Column Grid on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Personal Information */}
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                  Personal Information
                </h2>

                {/* Full Name */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Right Column - Membership Information */}
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                  Membership Details
                </h2>

                {/* Role Selection */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                    I want to join as *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors bg-white dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="Mentee">Mentee (I want to learn)</option>
                    <option value="Mentor">Mentor (I want to teach)</option>
                  </select>
                </div>

                {/* Membership Category */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                    Membership Category *
                  </label>
                  <select
                    name="membershipCategory"
                    value={formData.membershipCategory}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors bg-white dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="">Select your category</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>

                {/* Career Path / Specialization */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                    {formData.role === 'Mentor' ? 'Specialization *' : 'Interested Career Path *'}
                  </label>
                  <select
                    name="careerPath"
                    value={formData.careerPath}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors bg-white dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="">
                      {formData.role === 'Mentor' ? 'Select your specialization' : 'Select your career path'}
                    </option>
                    <option value="Full Stack Development">Full Stack Development</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Machine Learning/AI">Machine Learning/AI</option>
                    <option value="Data Science">Data Science</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>

                {/* Info Card */}
                <div className="bg-[#008080]/5 dark:bg-teal-500/10 rounded-lg p-4 border border-[#008080]/20 dark:border-teal-500/30">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="font-semibold text-[#008080] dark:text-teal-400">Note:</span> Your account will be reviewed by our team before approval. You'll receive a notification once your registration is confirmed.
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Section - Full Width */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 lg:p-6 space-y-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#008080] dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Membership Contract</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Please download, sign, and upload the membership agreement to complete your registration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Download Contract */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#008080]/30 dark:hover:border-teal-400/30 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-[#008080]/10 dark:bg-teal-400/10 rounded-lg">
                      <Download className="w-5 h-5 text-[#008080] dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Step 1: Download Contract</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Download and carefully read the membership agreement. Print and sign the document.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={downloadContract}
                    className="w-full flex items-center justify-center gap-2 bg-[#008080] dark:bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-all hover:shadow-md cursor-pointer text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download Agreement
                  </button>
                </div>

                {/* Upload Signed Contract */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-[#008080]/10 dark:bg-teal-400/10 rounded-lg">
                      <Upload className="w-5 h-5 text-[#008080] dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Step 2: Upload Signed Contract *</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Scan or photograph your signed contract and upload it here as a PDF file.
                      </p>
                    </div>
                  </div>
                  <div className={`
                    border-2 border-dashed rounded-lg p-5 text-center transition-all
                    ${formData.contractFile
                      ? 'border-green-300 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#008080] dark:hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="contract-upload"
                    />
                    <label htmlFor="contract-upload" className="cursor-pointer">
                      {formData.contractFile ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-semibold mb-1">
                            <FileText className="w-4 h-4" />
                            <span>{formData.contractFile.name}</span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {(formData.contractFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded successfully
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to replace file</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload signed contract</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only • Max 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full lg:w-auto lg:min-w-[280px] bg-[#008080] dark:bg-teal-600 text-white text-sm font-semibold py-2.5 px-8 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-[#008080] dark:text-teal-400 font-semibold hover:underline transition-colors">
                Sign in here
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

export default SignUpPage;