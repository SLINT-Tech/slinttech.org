import { Clock, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const PendingApprovalPage = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Check if user is a mentor
  const isMentor = currentUser.role === 'Mentor';

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">SlintTech</span>
            </Link>
            <Link 
              to="/login" 
              className="text-[#008080] hover:text-teal-700 font-medium cursor-pointer"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Account Pending Approval
          </h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Hello <span className="font-semibold text-[#008080]">{currentUser.fullName}</span>! 
            Your account is currently under review by our admin team.
          </p>

          {/* Status Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-yellow-800">Status: Pending Review</h3>
                <p className="text-yellow-700 text-sm">We're reviewing your membership application</p>
              </div>
            </div>
            
            <div className="text-left space-y-2 text-sm text-yellow-700">
              <p>✓ Application submitted successfully</p>
              <p>⏳ Admin review in progress</p>
              <p>📧 You'll receive an email notification once approved</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#008080] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p>Our admin team will review your application and contract</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#008080] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p>You'll receive an email notification with the approval status</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#008080] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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

          {/* Contact Support */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-[#008080] mr-2" />
              <h4 className="font-semibold text-gray-900">Need Help?</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about your application status, feel free to contact our support team.
            </p>
            <div className="flex items-center justify-center gap-2 text-[#008080]">
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