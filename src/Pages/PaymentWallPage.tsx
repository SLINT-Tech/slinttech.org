import { ArrowRight, CheckCircle, CreditCard, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PaymentWallPage = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate Paystack payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update user payment status
    const updatedUser = { ...currentUser, membershipPaid: true };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    setIsProcessing(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="ml-2 text-xl font-bold text-gray-900">SlintTech</span>
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
            <h3 className="font-semibold text-gray-900 mb-4">What you get with membership:</h3>
            <div className="space-y-3">
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
                Pay ₵{currentUser.membershipAmount} with Paystack
                <ArrowRight className="w-5 h-5" />
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