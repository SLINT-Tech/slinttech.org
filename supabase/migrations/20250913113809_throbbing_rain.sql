/*
  # Fix Storage Policies for Contract Upload

  This migration fixes the storage policies to use the correct Supabase storage authentication patterns.
  
  1. Security Updates
    - Drop existing problematic policies
    - Create new policies with correct expressions
    - Use proper file path parsing for user ownership
    - Enable proper JWT authentication
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all contracts" ON storage.objects;

-- Enable RLS on storage.objects (safe to run multiple times)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can upload their own contracts
CREATE POLICY "Users can upload own contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy 2: Users can view their own contracts
CREATE POLICY "Users can view own contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy 3: Users can update their own contracts
CREATE POLICY "Users can update own contracts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
  bucket_id = 'contracts' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy 4: Users can delete their own contracts
CREATE POLICY "Users can delete own contracts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy 5: Admins can manage all contracts
CREATE POLICY "Admins can manage all contracts"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'Admin'
  )
)
WITH CHECK (
  bucket_id = 'contracts' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'Admin'
  )
);