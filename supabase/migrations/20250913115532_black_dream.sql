/*
  # Fix Storage Policies - Remove Infinite Recursion

  1. Problem
    - Storage policies referencing user_profiles table cause infinite recursion
    - RLS policies on user_profiles conflict with storage policies

  2. Solution
    - Remove admin policy that references user_profiles table
    - Use simple user-based policies only
    - Admins can manage storage through dashboard/service role

  3. Security
    - Users can only access their own contract files
    - File paths are organized by user ID for security
    - Admin access handled through dashboard, not policies
*/

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own contracts" ON storage.objects;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for user contract access
CREATE POLICY "Users can upload own contracts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contracts' 
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own contracts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'contracts' 
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own contracts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contracts' 
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own contracts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contracts' 
    AND (string_to_array(name, '/'))[1] = auth.uid()::text
  );