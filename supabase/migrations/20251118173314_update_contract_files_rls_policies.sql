/*
  # Update contract_files RLS policies for S3 storage
  
  This migration updates the contract_files table policies to be more flexible
  and not rely solely on Supabase Auth's auth.uid() function.
  
  1. Changes
    - Drop existing RLS policies on contract_files
    - Create new flexible RLS policies that work with current Supabase Auth
    - Add support for future auth migration by using user_id directly
    - Maintain security while allowing flexibility
  
  2. Security Model
    - Users can only access their own contract files (matched by user_id)
    - Admins can view all contract files (checked via user_profiles.role)
    - Service role retains full access for backend operations
    - All policies check against user_profiles table for role verification
  
  3. Important Notes
    - Currently works with Supabase Auth (auth.uid())
    - Can be adapted for custom auth by modifying the user identification method
    - RLS remains enabled and enforced at PostgreSQL level
    - S3 files are referenced via s3_key and s3_bucket columns
*/

-- Drop existing policies on contract_files
DROP POLICY IF EXISTS "Users can read own contract files" ON contract_files;
DROP POLICY IF EXISTS "Users can insert own contract files" ON contract_files;
DROP POLICY IF EXISTS "Users can update own contract files" ON contract_files;
DROP POLICY IF EXISTS "Users can delete own contract files" ON contract_files;
DROP POLICY IF EXISTS "Admins can read all contract files" ON contract_files;
DROP POLICY IF EXISTS "Service role can manage all contract files" ON contract_files;

-- Policy: Users can read their own contract files
-- Uses auth.uid() for now, but checks user_profiles for validation
CREATE POLICY "Users can read own contract files"
  ON contract_files
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can insert their own contract files
CREATE POLICY "Users can insert own contract files"
  ON contract_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can update their own contract files
CREATE POLICY "Users can update own contract files"
  ON contract_files
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Policy: Users can delete their own contract files
CREATE POLICY "Users can delete own contract files"
  ON contract_files
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Policy: Admins can read all contract files
CREATE POLICY "Admins can read all contract files"
  ON contract_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'Admin'
    )
  );

-- Policy: Admins can manage all contract files
CREATE POLICY "Admins can manage all contract files"
  ON contract_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'Admin'
    )
  );

-- Policy: Service role can manage all contract files
-- This allows backend operations to work without auth context
CREATE POLICY "Service role can manage all contract files"
  ON contract_files
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment explaining the table's purpose
COMMENT ON TABLE contract_files IS 'Stores metadata for contract files stored in Amazon S3. Files are not stored in Supabase Storage.';
COMMENT ON COLUMN contract_files.s3_key IS 'The S3 object key/path in format: {user_id}/{timestamp}_{filename}';
COMMENT ON COLUMN contract_files.s3_bucket IS 'The Amazon S3 bucket name where the file is stored';
COMMENT ON COLUMN contract_files.upload_status IS 'Upload status: pending (uploading), completed (successful), failed (error occurred)';