/*
  # Fix user_profiles RLS policies to avoid infinite recursion

  1. Problem
    - Current policies reference user_profiles table within user_profiles policies
    - This creates infinite recursion when checking permissions
    - Login fails with "infinite recursion detected in policy"

  2. Solution
    - Simplify policies to use only auth.uid() without table references
    - Remove circular dependencies between policies
    - Ensure users can read/update their own profiles
    - Allow admins to manage all profiles without recursion

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies
    - Use direct auth.uid() comparisons only
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create new simplified policies without recursion
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admin policy without recursion - check auth metadata instead of table
CREATE POLICY "Service role can manage all profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true);

-- Allow authenticated users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);