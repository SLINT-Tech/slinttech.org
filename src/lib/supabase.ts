import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: window.location.origin
  }
});

// Types for our database
export interface UserProfile {
  id: string;
  full_name: string;
  membership_category: 'Student' | 'Professional' | 'Volunteer';
  career_path: string;
  role: 'Admin' | 'Mentor' | 'Mentee';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  specialization?: string;
  contract_file_url?: string;
  membership_enabled: boolean;
  membership_amount: number;
  membership_paid: boolean;
  payment_reference?: string;
  payment_date?: string;
  discord_link?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorMenteeRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  course_name: string;
  status: 'active' | 'inactive' | 'completed' | 'paused';
  assigned_date: string;
  completion_date?: string;
  progress_percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data from user_profiles
  mentor?: UserProfile;
  mentee?: UserProfile;
}