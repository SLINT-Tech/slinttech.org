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
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize from localStorage if available
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        return {
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
        };
      }
    } catch (error) {
      console.error('Error parsing localStorage auth data:', error);
    }
    
    return {
      user: null,
      profile: null,
      loading: true,
      isAuthenticated: false
    };
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // If we already have cached data, verify it's still valid
        if (authState.user && authState.profile) {
          console.log('Using cached auth data for:', authState.profile.full_name);
          
          // Verify session is still valid in background
          const { data: { session } } = await supabase.auth.getSession();
          if (!session && mounted) {
            console.log('Cached session invalid, clearing auth state');
            clearAuthState();
          }
          return;
        }

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('Valid session found, fetching profile for:', session.user.id);
          await fetchAndSetProfile(session.user);
        } else if (mounted) {
          console.log('No valid session found');
          setAuthState(prev => ({ ...prev, loading: false }));
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
  }, []);

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
      });
      
      // Update auth state
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
    isAuthenticated: authState.isAuthenticated
  };
};