import { ArrowRight, CheckCircle, Download, FileText, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormSelect, { type FormSelectOption } from '../Components/FormSelect';
import Toast from '../Components/Toast';
import { buildApiUrl } from '../lib/api';

type MemberRole = 'Mentee' | 'Mentor';

const ROLE_OPTIONS: FormSelectOption<MemberRole>[] = [
  { value: 'Mentee', label: 'Mentee (I want to learn)' },
  { value: 'Mentor', label: 'Mentor (I want to teach)' },
];

const MEMBERSHIP_CATEGORY_OPTIONS: FormSelectOption[] = [
  { value: 'Student', label: 'Student' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Volunteer', label: 'Volunteer' },
];

const CAREER_PATH_OPTIONS: FormSelectOption[] = [
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Machine Learning/AI',
  'Data Science',
  'UI/UX Design',
].map(path => ({ value: path, label: path }));

const labelClassName = 'block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm';

// Height and colours match the FormSelect trigger so every field in the form lines up.
const inputClassName = 'h-12 w-full border border-gray-300 bg-white text-base text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 focus:border-[#008080] dark:focus:border-teal-400 focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-teal-400/20 focus:outline-none transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400';

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
    role: 'Mentee' as MemberRole,
    contractFile: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success'; } | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Create FormData with all fields + contract file (single atomic request)
      const submitData = new FormData();
      submitData.append('email', formData.email.trim());
      submitData.append('password', formData.password);
      submitData.append('fullName', formData.fullName.trim());
      submitData.append('membershipCategory', formData.membershipCategory);
      submitData.append('careerPath', formData.careerPath);
      submitData.append('role', formData.role);
      if (formData.role === 'Mentor') {
        submitData.append('specialization', formData.careerPath);
      }
      submitData.append('file', formData.contractFile);

      let response;
      try {
        // Single request with all data + file
        response = await fetch(buildApiUrl('/auth-signup'), {
          method: 'POST',
          body: submitData, // No Content-Type header - browser sets it with boundary
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
                aria-label="Close and return to the home page"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X aria-hidden="true" className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/20 dark:border-gray-800/50 p-6 sm:p-8 transition-colors">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="/assets/logo.svg"
              alt="SLINT Tech"
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
                  <label htmlFor="signup-fullName" className={labelClassName}>
                    Full Name *
                  </label>
                  <input
                    id="signup-fullName"
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="signup-email" className={labelClassName}>
                    Email Address *
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="signup-password" className={labelClassName}>
                    Password *
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="signup-confirmPassword" className={labelClassName}>
                    Confirm Password *
                  </label>
                  <input
                    id="signup-confirmPassword"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={inputClassName}
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

                <FormSelect
                  label="I want to join as"
                  value={formData.role}
                  onChange={role => setFormData(prev => ({ ...prev, role }))}
                  options={ROLE_OPTIONS}
                  required
                />

                <FormSelect
                  label="Membership Category"
                  value={formData.membershipCategory}
                  onChange={membershipCategory => setFormData(prev => ({ ...prev, membershipCategory }))}
                  options={MEMBERSHIP_CATEGORY_OPTIONS}
                  placeholder="Select your category"
                  required
                />

                <FormSelect
                  label={formData.role === 'Mentor' ? 'Specialization' : 'Interested Career Path'}
                  value={formData.careerPath}
                  onChange={careerPath => setFormData(prev => ({ ...prev, careerPath }))}
                  options={CAREER_PATH_OPTIONS}
                  placeholder={formData.role === 'Mentor' ? 'Select your specialization' : 'Select your career path'}
                  required
                />

                {/* Info Card */}
                <div className="bg-[#008080]/5 dark:bg-teal-500/10 rounded-lg p-4 border border-[#008080]/20 dark:border-teal-500/30">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="font-semibold text-[#006666] dark:text-teal-400">Note:</span> Your account will be reviewed by our team before approval. You'll receive a notification once your registration is confirmed.
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Section - Full Width */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 lg:p-6 space-y-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <FileText aria-hidden="true" className="w-5 h-5 text-[#008080] dark:text-teal-400 flex-shrink-0 mt-0.5" />
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
                      <Download aria-hidden="true" className="w-5 h-5 text-[#008080] dark:text-teal-400" />
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
                    className="w-full flex items-center justify-center gap-2 bg-[#008080] text-white px-4 py-2.5 rounded-lg hover:bg-[#006666] transition-all hover:shadow-md cursor-pointer text-sm font-medium"
                  >
                    <Download aria-hidden="true" className="w-4 h-4" />
                    Download Agreement
                  </button>
                </div>

                {/* Upload Signed Contract */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-[#008080]/10 dark:bg-teal-400/10 rounded-lg">
                      <Upload aria-hidden="true" className="w-5 h-5 text-[#008080] dark:text-teal-400" />
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
                      className="peer sr-only"
                      id="contract-upload"
                      // Safari skips file inputs on Tab by default; keep the required upload reachable.
                      tabIndex={0}
                      aria-describedby={formData.contractFile ? undefined : "contract-upload-hint"}
                    />
                    <label htmlFor="contract-upload" className="block cursor-pointer rounded-md peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#008080] dark:peer-focus-visible:outline-teal-400">
                      {formData.contractFile ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle aria-hidden="true" className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-semibold mb-1">
                            <FileText aria-hidden="true" className="w-4 h-4" />
                            <span>{formData.contractFile.name}</span>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                            {(formData.contractFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded successfully
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to replace file</p>
                        </div>
                      ) : (
                        <div>
                          <Upload aria-hidden="true" className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload signed contract</p>
                          <p id="contract-upload-hint" className="text-xs text-gray-500 dark:text-gray-400">PDF files only • Max 10MB</p>
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
                className="w-full lg:w-auto lg:min-w-[280px] bg-[#008080] text-white text-sm font-semibold py-2.5 px-8 rounded-lg hover:bg-[#006666] transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight aria-hidden="true" className="w-5 h-5" />
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