import { ArrowRight, CheckCircle, CreditCard, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../Components/SkeletonLoader';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';

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
  const { profile, loading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [membershipAmount, setMembershipAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const isMentor = profile?.role === 'Mentor';

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token || !profile) {
      navigate('/login');
      return;
    }

    if (profile.membershipPaid) {
      const dashboardPath = profile.role === 'Mentor' ? '/mentor/dashboard' : '/dashboard';
      navigate(dashboardPath);
      return;
    }

    if (!profile.membershipEnabled) {
      const dashboardPath = profile.role === 'Mentor' ? '/mentor/dashboard' : '/dashboard';
      navigate(dashboardPath);
      return;
    }

    setMembershipAmount(parseFloat(profile.membershipAmount || '30.00'));
    setIsLoading(false);
  }, [profile, authLoading, token, navigate]);

  if (authLoading || isLoading || !profile) {
    return <PageLoader message="Loading payment information..." />;
  }

  const handlePayment = async () => {
    if (!window.PaystackPop) {
      alert('Payment system is not available. Please refresh the page and try again.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/payment-initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const paymentData = await response.json();

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: paymentData.email,
        amount: paymentData.amount,
        currency: 'GHS',
        ref: paymentData.reference,
        metadata: {
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "userId",
              value: paymentData.metadata.userId
            },
            {
              display_name: "Full Name",
              variable_name: "fullName",
              value: paymentData.metadata.fullName
            },
            {
              display_name: "Membership Type",
              variable_name: "membershipType",
              value: paymentData.metadata.membershipType
            }
          ]
        },
        callback: function(response) {
          if (response.status === 'success') {
            console.log('Payment successful, verifying...');
            setPaymentStatus('verifying');

            fetch(`${API_BASE_URL}/payment-verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ reference: response.reference })
            })
              .then(verifyResponse => {
                if (!verifyResponse.ok) {
                  throw new Error('Payment verification failed');
                }
                return verifyResponse.json();
              })
              .then(verifyData => {
                console.log('Payment verified:', verifyData);
                setIsProcessing(false);
                setPaymentStatus('success');

                setTimeout(() => {
                  const dashboardPath = isMentor ? '/mentor/dashboard' : '/dashboard';
                  window.location.href = dashboardPath;
                }, 3000);
              })
              .catch(verifyError => {
                console.error('Verification error:', verifyError);
                setPaymentStatus('idle');
                alert('Payment was successful but verification failed. Please contact support.');
                setIsProcessing(false);
              });
          } else {
            console.log('Payment failed:', response);
            alert('Payment was not successful. Please try again.');
            setIsProcessing(false);
          }
        },
        onClose: function() {
          console.log('Payment modal closed');
          setIsProcessing(false);
        }
      });

      handler.openIframe();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setError(error.message || 'Failed to initialize payment');
      alert(error.message || 'Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };


  if (isLoading) {
    return <PageLoader message="Loading payment information..." />;
  }

  if (!profile || !membershipAmount || membershipAmount <= 0) {
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
              Congratulations <span className="font-semibold text-[#008080]">{profile.fullName}</span>!
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
                <div className="text-3xl font-bold">₵{membershipAmount}</div>
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
                Pay ₵{membershipAmount.toFixed(2)}
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

      {paymentStatus === 'verifying' && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            <svg
              className="animate-spin h-16 w-16 text-[#008080] mx-auto mb-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 mb-2">
              Welcome to SlintTech, <span className="font-semibold text-[#008080]">{profile?.fullName}</span>!
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Your membership is now active. Redirecting to your dashboard...
            </p>

            <div className="flex items-center justify-center gap-2 text-[#008080]">
              <div className="w-2 h-2 bg-[#008080] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#008080] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#008080] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentWallPage;