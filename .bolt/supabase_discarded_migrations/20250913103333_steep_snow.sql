/*
  # Setup Contract Document Storage

  1. Storage Setup
    - Create `contracts` bucket for storing user contract documents
    - Enable public access for contract downloads
    - Set up RLS policies for secure access

  2. Security
    - Users can only access their own contract documents
    - Admins can access all contract documents
    - Public read access for contract downloads with proper authentication

  3. File Organization
    - Files stored as: `{user_id}/contract_{timestamp}.pdf`
    - Ensures unique filenames and user isolation
*/

-- Create contracts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
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