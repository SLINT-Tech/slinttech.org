/*
  # Create contracts storage bucket with proper permissions

  1. Storage Setup
    - Create 'contracts' bucket for storing user contract files
    - Set bucket as private for security
    - Configure file size limits and MIME type restrictions

  2. Security Policies
    - Users can upload their own contracts
    - Users can view their own contracts
    - Users can update their own contracts
    - Users can delete their own contracts
    - Service role has full access for admin operations

  3. Bucket Configuration
    - Private bucket (not publicly accessible)
    - PDF files only
    - 5MB file size limit
    - Organized by user ID folders
*/

-- Create the contracts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts', 
  false,
  5242880,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for users to upload their own contracts
CREATE POLICY "Users can upload own contracts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'contracts' AND 
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy for users to view their own contracts
CREATE POLICY "Users can view own contracts" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'contracts' AND 
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy for users to update their own contracts
CREATE POLICY "Users can update own contracts" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'contracts' AND 
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy for users to delete their own contracts
CREATE POLICY "Users can delete own contracts" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'contracts' AND 
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy for service role to have full access (for admin operations)
CREATE POLICY "Service role can manage all contracts" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'contracts')
WITH CHECK (bucket_id = 'contracts');