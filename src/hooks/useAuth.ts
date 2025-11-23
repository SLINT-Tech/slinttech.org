import { useEffect, useState } from 'react';
import { logout } from '../lib/auth';

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
  discordLink?: string;
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
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
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const signOut = (redirectTo: string = '/login') => {
    setProfile(null);
    logout(redirectTo);
  };

  return {
    profile,
    loading,
    signOut,
    isAuthenticated: !!profile
  };
};
