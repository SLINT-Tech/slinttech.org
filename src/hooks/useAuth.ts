import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, clearAuthData } from '../lib/auth';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  membershipCategory: string;
  careerPath?: string;
  role: string;
  status: string;
  specialization?: string;
  contractFileUrl?: string;
  membershipEnabled: boolean;
  membershipAmount: string;
  membershipPaid: boolean;
  paymentReference?: string;
  paymentDate?: string;
  communityLink?: string;
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth-me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        clearAuthData();
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const signOut = (redirectTo: string = '/login') => {
    setProfile(null);
    logout(navigate, redirectTo);
  };

  return {
    profile,
    loading,
    signOut,
    isAuthenticated: !!profile
  };
};
