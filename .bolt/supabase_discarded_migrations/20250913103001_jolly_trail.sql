/*
  # Create user profiles and authentication schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `membership_category` (text)
      - `career_path` (text)
      - `role` (text, default 'Mentee')
      - `status` (text, default 'pending')
      - `specialization` (text, nullable for mentors)
      - `contract_file_url` (text, nullable)
      - `membership_enabled` (boolean, default false)
      - `membership_amount` (decimal, default 30.00)
      - `membership_paid` (boolean, default false)
      - `payment_reference` (text, nullable)
      - `payment_date` (timestamp, nullable)
      - `discord_link` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
    - Add policy for admins to manage all profiles

  3. Functions
    - Trigger to create profile when user signs up
    - Function to handle profile creation
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  membership_category text NOT NULL CHECK (membership_category IN ('Student', 'Professional', 'Volunteer')),
  career_path text,
  role text NOT NULL DEFAULT 'Mentee' CHECK (role IN ('Admin', 'Mentor', 'Mentee')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  specialization text,
  contract_file_url text,
  membership_enabled boolean DEFAULT false,
  membership_amount decimal(10,2) DEFAULT 30.00,
  membership_paid boolean DEFAULT false,
  payment_reference text,
  payment_date timestamptz,
  discord_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
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

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, membership_category, career_path, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'membership_category', 'Student'),
    COALESCE(new.raw_user_meta_data->>'career_path', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'Mentee')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();