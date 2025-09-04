import { ArrowRight, CheckCircle, Download, FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../Components/Toast';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    membershipCategory: '',
    contractFile: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

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
      // Validate file type
      if (file.type !== 'application/pdf') {
        setToast({
          message: 'Please upload a PDF file only.',
          type: 'error'
        });
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (1MB = 1 * 1024 * 1024 bytes)
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        setToast({
          message: 'File size must be less than 1MB.',
          type: 'error'
        });
        e.target.value = ''; // Clear the input
        return;
      }

      setFormData(prev => ({
        ...prev,
        contractFile: file
      }));

      setToast({
        message: 'Contract uploaded successfully!',
        type: 'success'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically send the data to your backend
    console.log('Registration data:', formData);
    
    setIsSubmitting(false);
    alert('Registration submitted successfully! Check your email for login credentials.');
  };

  const downloadContract = () => {
    // Direct download approach
   
    const filename = 'slint_tech_membership_agreement_and_contract.pdf';
    const link = document.createElement('a');
    link.href = `/documents/${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
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
              Join Our <span className="text-[#008080]">Community</span>
            </h1>
            <p className="text-gray-600">
              Start your journey with SlintTech and connect with mentors who will guide your growth.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address *
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

            {/* Membership Category */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Membership Category *
              </label>
              <select
                name="membershipCategory"
                value={formData.membershipCategory}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 focus:outline-none transition-colors"
                required
              >
                <option value="">Select your category</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>

            {/* Contract Section */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Membership Contract</h3>
              
              {/* Download Contract */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="p-2">
                  <p className="font-medium text-gray-900">Download Contract Form</p>
                  <p className="text-xs text-gray-500">Please read and sign the membership agreement</p>
                  <p className="text-xs text-gray-500">Once you sign the membership agreement, kindly upload the document below.</p>
                </div>
                <button
                  type="button"
                  onClick={downloadContract}
                  className="flex items-center gap-2 bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              {/* Upload Signed Contract */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Signed Contract *
                </label>
                <div className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-colors
                  ${formData.contractFile 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-[#008080]'
                  }
                `}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="contract-upload"
                    required
                  />
                  <label htmlFor="contract-upload" className="cursor-pointer">
                    {formData.contractFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="flex items-center gap-2 text-green-700 font-medium">
                          <FileText className="w-4 h-4" />
                          <span>{formData.contractFile.name}</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          File uploaded successfully • {(formData.contractFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Click to replace file</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload signed contract</p>
                        <p className="text-sm text-gray-500 mt-1">PDF files only • Max 1MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#008080] text-white font-semibold py-4 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Register as Member
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#008080] font-medium hover:underline">
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