import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false
  });

  const [hasInitialData, setHasInitialData] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check localStorage first for immediate display
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && mounted) {
          try {
            const userData = JSON.parse(currentUser);
            console.log('Found cached auth data for:', userData.fullName);
            
            // Set auth state immediately from localStorage
            setAuthState({
              user: { id: userData.id, email: userData.email } as User,
              profile: {
                id: userData.id,
                full_name: userData.fullName,
                membership_category: userData.membershipCategory,
                career_path: userData.careerPath,
                role: userData.role,
                status: userData.status,
                specialization: userData.specialization,
                contract_file_url: userData.contractFileUrl,
                membership_enabled: userData.membershipEnabled,
                membership_amount: userData.membershipAmount,
                membership_paid: userData.membershipPaid,
                payment_reference: userData.paymentReference,
                payment_date: userData.paymentDate,
                discord_link: userData.discordLink,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as UserProfile,
              loading: false,
              isAuthenticated: true
            });
            setHasInitialData(true);
          } catch (error) {
            console.error('Error parsing localStorage auth data:', error);
            clearAuthState();
          }
        }

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('Valid session found, fetching profile for:', session.user.id);
          await fetchAndSetProfile(session.user);
        } else if (mounted) {
          console.log('No valid session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          clearAuthState();
        }
      }
    };

    const fetchAndSetProfile = async (user: User) => {
      try {
        console.log('Fetching profile for user:', user.id);
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          if (mounted) {
            clearAuthState();
          }
          return;
        }

        console.log('Profile fetched successfully:', profile.full_name);

        // Update localStorage
        const userData = {
          id: user.id,
          email: user.email,
          fullName: profile.full_name,
          membershipCategory: profile.membership_category,
          careerPath: profile.career_path,
          role: profile.role,
          status: profile.status,
          specialization: profile.specialization,
          contractFileUrl: profile.contract_file_url,
          membershipEnabled: profile.membership_enabled,
          membershipAmount: profile.membership_amount,
          membershipPaid: profile.membership_paid,
          paymentReference: profile.payment_reference,
          paymentDate: profile.payment_date,
          discordLink: profile.discord_link
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));

        if (mounted) {
          setAuthState({
            user,
            profile,
            loading: false,
            isAuthenticated: true
          });
          setHasInitialData(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (mounted) {
          clearAuthState();
        }
      }
    };

    const clearAuthState = () => {
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
      setHasInitialData(false);
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false
      });
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user && mounted) {
          await fetchAndSetProfile(session.user);
        } else if (mounted) {
          clearAuthState();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove authState dependency to prevent loops

  const signOut = async () => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all storage data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
      
      // Update auth state
      setHasInitialData(false);
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false
      });
      
      console.log('Successfully logged out and cleared all data');
      
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local data even if Supabase logout fails
      localStorage.clear();
      sessionStorage.clear();
      setHasInitialData(false);
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false
      });
      window.location.href = '/';
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    signOut,
    isAuthenticated: authState.isAuthenticated,
    hasInitialData
  };
};