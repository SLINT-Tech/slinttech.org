import { useEffect, useState } from 'react';

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
      const token = localStorage.getItem('authToken');

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
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('authToken');
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    try {
      localStorage.removeItem('authToken');
      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      setProfile(null);
      console.log('Successfully logged out and cleared all data');
    } catch (error) {
      console.error('Error during logout:', error);
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  return {
    profile,
    loading,
    signOut,
    isAuthenticated: !!profile
  };
};
