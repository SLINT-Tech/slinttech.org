import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        console.log('Auth state changed:', event, session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      console.log('Profile fetched successfully:', data.full_name);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all localStorage data
      localStorage.clear();
      
      // Clear all sessionStorage data
      sessionStorage.clear();
      
      // Clear any cookies (if you're using any)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      console.log('Successfully logged out and cleared all data');
      
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local data even if Supabase logout fails
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};