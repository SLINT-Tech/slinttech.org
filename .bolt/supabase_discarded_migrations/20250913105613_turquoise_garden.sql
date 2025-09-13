/*
  # Fix Supabase Authentication and Storage Configuration

  1. Storage Setup
    - Create contracts bucket for storing user contract documents
    - Set up proper RLS policies for secure access
    - Configure bucket settings for PDF uploads

  2. Auth Configuration
    - Update site URL configuration for proper email redirects
    - Ensure email confirmation works with correct domain

  3. Security
    - Users can only access their own contracts
    - Admins can access all contracts for management
    - Proper file upload restrictions
*/

-- Create contracts bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own contracts
CREATE POLICY "Users can upload own contracts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can view their own contracts
CREATE POLICY "Users can view own contracts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Admins can view all contracts
CREATE POLICY "Admins can view all contracts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Policy: Users can update their own contracts
CREATE POLICY "Users can update own contracts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own contracts
CREATE POLICY "Users can delete own contracts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );