import { ArrowRight, CheckCircle, CreditCard, Shield } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// Declare PaystackPop for TypeScript
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata: {
          custom_fields: Array<{
            display_name: string;
            variable_name: string;
            value: string;
          }>;
        };
        callback: (response: { reference: string; status: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

const PaymentWallPage = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  // Check if user is a mentor
  const isMentor = currentUser.role === 'Mentor';

  // Generate unique payment reference
  const generatePaymentRef = () => {
    return `slint_${currentUser.id}_${Date.now()}`;
  };

  // Verify payment amount from user data (simulate database check)
  const verifyPaymentAmount = () => {
    // In production, this would be a secure API call to verify the amount
    // For now, we use the stored user data
    return currentUser.membershipAmount || 30;
  };

  const handlePayment = async () => {
    if (!window.PaystackPop) {
      alert('Payment system is not available. Please refresh the page and try again.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Verify amount from secure source (simulate database check)
      const verifiedAmount = verifyPaymentAmount();
      
      // Convert amount to kobo (Paystack uses kobo for GHS)
      const amountInKobo = verifiedAmount * 100;
      
      const paymentRef = generatePaymentRef();
      
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: currentUser.email,
        amount: amountInKobo,
        currency: 'GHS',
        ref: paymentRef,
        metadata: {
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: currentUser.id.toString()
            },
            {
              display_name: "Full Name",
              variable_name: "full_name",
              value: currentUser.fullName
            },
            {
              display_name: "Membership Type",
              variable_name: "membership_type",
              value: "One-time Membership"
            }
          ]
        },
        callback: function(response) {
          if (response.status === 'success') {
            // Payment successful
            console.log('Payment successful:', response);
            
            // Update user payment status
            const updatedUser = { 
              ...currentUser, 
              membershipPaid: true,
              paymentReference: response.reference,
              paymentDate: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Show success modal
            setShowPaymentModal(true);
          } else {
            // Payment failed
            console.log('Payment failed:', response);
            alert('Payment was not successful. Please try again.');
          }
          setIsProcessing(false);
        },
        onClose: function() {
          // User closed the payment modal
          console.log('Payment modal closed');
          setIsProcessing(false);
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // Navigate to appropriate dashboard based on user role
    if (isMentor) {
      navigate('/mentor/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  // Security check - ensure user has valid membership amount
  const membershipAmount = verifyPaymentAmount();
  
  if (!membershipAmount || membershipAmount <= 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Membership</h1>
          <p className="text-gray-600 mb-6">
            There seems to be an issue with your membership configuration. Please contact support.
          </p>
          <Link to="/login" className="text-[#008080] hover:text-teal-700 font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Account Approved!
            </h1>
            
            <p className="text-gray-600 mb-2">
              Congratulations <span className="font-semibold text-[#008080]">{currentUser.fullName}</span>! 
              Your account has been approved.
            </p>
            
            <p className="text-gray-600">
              Complete your one-time membership payment to access your dashboard.
            </p>
          </div>

          {/* Payment Card */}
          <div className="bg-gradient-to-br from-[#008080] to-teal-700 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">Membership Payment</h3>
                  <p className="text-teal-100">One-time payment required</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₵{currentUser.membershipAmount}</div>
                <div className="text-teal-100 text-sm">GHS</div>
              </div>
            </div>
            
            <div className="border-t border-teal-400 pt-4">
              <div className="flex items-center text-teal-100 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Secure payment powered by Paystack
              </div>
            </div>
          </div>

          {/* What You Get */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              {isMentor ? 'What you get as a mentor:' : 'What you get with membership:'}
            </h3>
            <div className="space-y-3">
              {isMentor ? (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Access to mentor dashboard and tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Create and manage courses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Mentee management and progress tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Task assignment and review system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Community Discord mentor access</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Access to all courses and learning materials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Personal mentorship and guidance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Community Discord access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Project assignments and feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Certificate upon completion</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-[#008080] text-white font-semibold py-4 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </>
            ) : (
              <>
                Pay ₵{currentUser.membershipAmount}
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Secure Payment</p>
                <p>Your payment is processed securely through Paystack. We don't store your card details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Welcome to SlintTech! Your membership is now active.
              </p>
              
              <button
                onClick={handlePaymentSuccess}
                className="w-full bg-[#008080] text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Access Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentWallPage;