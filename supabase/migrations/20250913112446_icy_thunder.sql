/*
  # Fix Storage Policies for Contract Upload

  1. Security Updates
    - Enable RLS on storage.objects table
    - Create proper policies for contract uploads
    - Fix user folder access permissions

  2. Policy Changes
    - User upload policy with proper folder structure
    - User access policy for own contracts
    - Admin full access policy

  3. Important Notes
    - Policies use auth.uid() for user identification
    - Folder structure: {user_id}/contract_{timestamp}.pdf
    - Only PDF files allowed in contracts bucket
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all contracts" ON storage.objects;

-- Policy 1: Allow users to upload contracts to their own folder
CREATE POLICY "Users can upload own contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND auth.role() = 'authenticated'
);

-- Policy 2: Allow users to view their own contracts
CREATE POLICY "Users can view own contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow users to update their own contracts
CREATE POLICY "Users can update own contracts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow users to delete their own contracts
CREATE POLICY "Users can delete own contracts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND auth.role() = 'authenticated'
);

-- Policy 5: Allow admins to manage all contracts
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