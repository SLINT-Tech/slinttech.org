import { CheckCircle, CreditCard, Shield, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../Components/SkeletonLoader';
import { apiPost } from '../lib/api';

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

    const membershipPaid = (profile as any).membershipPaid || (profile as any).membership_paid;
    const membershipEnabled = (profile as any).membershipEnabled || (profile as any).membership_enabled;
    const membershipAmountValue = (profile as any).membershipAmount || (profile as any).membership_amount;

    if (membershipPaid) {
      const dashboardPath = profile.role === 'Mentor' ? '/mentor/dashboard' : '/dashboard';
      navigate(dashboardPath, { replace: true });
      return;
    }

    if (!membershipEnabled) {
      const dashboardPath = profile.role === 'Mentor' ? '/mentor/dashboard' : '/dashboard';
      navigate(dashboardPath, { replace: true });
      return;
    }

    setMembershipAmount(parseFloat(membershipAmountValue || '30.00'));
    setIsLoading(false);
  }, [profile, authLoading, token, navigate]);

  if (!authLoading && profile) {
    const membershipPaid = (profile as any).membershipPaid || (profile as any).membership_paid;
    const membershipEnabled = (profile as any).membershipEnabled || (profile as any).membership_enabled;
    if (membershipPaid || !membershipEnabled) {
      return <PageLoader message="Redirecting to dashboard..." />;
    }
  }

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
      const paymentData = await apiPost('/payment/initialize');

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

            apiPost('/payment/verify', { reference: response.reference })
              .then(verifyData => {
                console.log('Payment verified:', verifyData);
                setIsProcessing(false);
                setPaymentStatus('success');

                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                currentUser.membershipPaid = true;
                currentUser.paymentReference = response.reference;
                currentUser.paymentDate = new Date().toISOString();
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                setTimeout(() => {
                  const dashboardPath = isMentor ? '/mentor/dashboard' : '/dashboard';
                  navigate(dashboardPath, { replace: true });
                }, 5000);
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
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 text-center max-w-md transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Invalid Membership</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">
            There seems to be an issue with your membership configuration. Please contact support.
          </p>
          <Link to="/login" className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-2xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
              <span className="text-xl text-[#008080] dark:text-[#008080] hidden md:block transition-colors">
                <span className="font-bold">SLINT</span><span className="ml-[1.5px]">Tech</span>
              </span>
            </Link>
            <Link
              to="/login"
              className="text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium cursor-pointer transition-colors"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900/30 p-8 transition-colors">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 transition-colors" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Account Approved!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-2 transition-colors">
              Congratulations <span className="font-semibold text-[#008080] dark:text-teal-400 transition-colors">{profile.fullName}</span>!
              Your account has been approved.
            </p>

            <p className="text-gray-600 dark:text-gray-300 transition-colors">
              Complete your one-time membership payment to access your dashboard.
            </p>
          </div>

          {/* Payment Card */}
          <div className="bg-gradient-to-br from-[#008080] dark:from-teal-600 to-teal-700 dark:to-teal-800 rounded-xl p-6 text-white mb-8 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">Membership Payment</h3>
                  <p className="text-teal-100 dark:text-teal-200 transition-colors">One-time payment required</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₵{membershipAmount}</div>
                <div className="text-teal-100 dark:text-teal-200 text-sm transition-colors">GHS</div>
              </div>
            </div>

            <div className="border-t border-teal-400 dark:border-teal-500 pt-4 transition-colors">
              <div className="flex items-center text-teal-100 dark:text-teal-200 text-sm transition-colors">
                <Shield className="w-4 h-4 mr-2" />
                Secure payment powered by Paystack
              </div>
            </div>
          </div>

          {/* What You Get */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors">
              {isMentor ? 'What you get as a mentor:' : 'What you get with membership:'}
            </h3>
            <div className="space-y-3">
              {isMentor ? (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Access to mentor dashboard and tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Create and manage courses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Mentee management and progress tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Task assignment and review system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Community Slack mentor access</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Access to all courses and learning materials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Personal mentorship and guidance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Community Slack access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Project assignments and feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 transition-colors" />
                    <span className="text-gray-700 dark:text-gray-300 transition-colors">Certificate upon completion</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-[#008080] dark:bg-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />
              <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                <p className="font-medium mb-1">Secure Payment</p>
                <p>Your payment is processed securely through Paystack. We don't store your card details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {paymentStatus === 'verifying' && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-8 text-center transition-colors">
            <Loader2 className="w-16 h-16 text-[#008080] dark:text-teal-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Verifying Payment</h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors">Please wait while we confirm your payment...</p>
          </div>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-8 text-center transition-colors">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2 transition-colors">
              Welcome to SlintTech, <span className="font-semibold text-[#008080] dark:text-teal-400">{profile?.fullName}</span>!
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 transition-colors">
              Your membership is now active. Redirecting to your dashboard...
            </p>

            <div className="flex items-center justify-center gap-2 text-[#008080] dark:text-teal-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentWallPage;