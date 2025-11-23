import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Mentee' | 'Mentor' | 'Admin';
  requireApproval?: boolean;
  requirePayment?: boolean;
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requireApproval = true,
  requirePayment = true
}: ProtectedRouteProps) => {
  const currentUserStr = localStorage.getItem('currentUser');
  const token = localStorage.getItem('token');

  if (!currentUserStr || !token) {
    if (requiredRole === 'Admin') {
      return <Navigate to="/admin/login" replace />;
    }
    if (requiredRole === 'Mentor') {
      return <Navigate to="/mentor/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const currentUser = JSON.parse(currentUserStr);

  if (requiredRole && currentUser.role !== requiredRole) {
    if (currentUser.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentUser.role === 'Mentor') {
      return <Navigate to="/mentor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  if (currentUser.status === 'rejected') {
    const loginPath = currentUser.role === 'Mentor' ? '/mentor/login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  if (currentUser.status === 'suspended') {
    const loginPath = currentUser.role === 'Mentor' ? '/mentor/login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  if (requireApproval && currentUser.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requireApproval && currentUser.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (requirePayment && currentUser.membershipEnabled && !currentUser.membershipPaid) {
    return <Navigate to="/payment-wall" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
