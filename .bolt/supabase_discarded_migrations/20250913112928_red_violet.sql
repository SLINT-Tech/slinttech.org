/*
  # Fix Storage Policies for JWT Authentication

  This migration fixes the storage policies to use proper JWT-based authentication
  that works reliably in the storage context, resolving the "new row violates 
  row-level security policy" error.

  ## Changes Made
  1. Updated policy expressions to use `(select auth.uid())` instead of `auth.uid()`
  2. Simplified expressions to focus on core authentication
  3. Ensures policies work immediately after user signup
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all contracts" ON storage.objects;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can upload their own contracts
CREATE POLICY "Users can upload own contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Policy 2: Users can view their own contracts
CREATE POLICY "Users can view own contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Policy 3: Admins can manage all contracts
CREATE POLICY "Admins can manage all contracts"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'Admin'
  )
);