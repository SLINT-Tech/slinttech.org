/*
  # Create contracts storage bucket with policies

  1. Storage Setup
    - Create 'contracts' bucket for PDF contract files
    - Set 5MB file size limit
    - Restrict to PDF files only
    - Private bucket for security

  2. Security Policies
    - Users can upload contracts to their own folder
    - Users can view their own contracts
    - Admins can manage all contracts

  3. File Organization
    - Each user gets their own folder by user ID
    - Timestamped filenames prevent conflicts
*/

-- Create the contracts storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts', 
  false,
  5242880, -- 5MB in bytes
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can upload contracts to their own folder
CREATE POLICY "Users can upload own contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own contracts
CREATE POLICY "Users can view own contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own contracts
CREATE POLICY "Users can update own contracts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own contracts
CREATE POLICY "Users can delete own contracts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
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
);

-- Policy 6: Admins can insert contracts for any user
CREATE POLICY "Admins can upload contracts for any user"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'Admin'
  )
);