import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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