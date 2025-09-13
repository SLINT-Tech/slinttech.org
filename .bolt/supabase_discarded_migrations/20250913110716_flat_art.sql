/*
  # Setup contracts storage bucket and policies

  1. Storage Setup
    - Create contracts bucket for PDF uploads
    - Configure bucket settings for security
    - Set file size and type restrictions

  2. Security Policies
    - Users can upload/view their own contracts
    - Admins can manage all contracts
    - Proper folder-based access control

  Note: This migration creates the bucket and policies using available permissions
*/

-- Create the contracts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts', 
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload contracts to their own folder
CREATE POLICY "Users can upload own contracts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'contracts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own contracts
CREATE POLICY "Users can view own contracts" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'contracts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own contracts
CREATE POLICY "Users can update own contracts" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'contracts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own contracts
CREATE POLICY "Users can delete own contracts" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'contracts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can manage all contracts
CREATE POLICY "Admins can manage all contracts" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'contracts' AND 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'Admin'
  )
);