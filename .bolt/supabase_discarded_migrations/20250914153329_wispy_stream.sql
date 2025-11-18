/*
  # Create mentor-mentee relationships table

  1. New Tables
    - `mentor_mentee_relationships`
      - `id` (uuid, primary key)
      - `mentor_id` (uuid, foreign key to user_profiles)
      - `mentee_id` (uuid, foreign key to user_profiles)
      - `course_name` (text)
      - `status` (text, enum: active, inactive, completed, paused)
      - `assigned_date` (timestamp)
      - `completion_date` (timestamp, nullable)
      - `progress_percentage` (integer, default 0)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `mentor_mentee_relationships` table
    - Add policies for mentors to manage their mentees
    - Add policies for mentees to view their mentor relationships
    - Add policies for admins to manage all relationships

  3. Indexes
    - Index on mentor_id for efficient mentor queries
    - Index on mentee_id for efficient mentee queries
    - Composite index on (mentor_id, mentee_id) for relationship lookups
*/

-- Create mentor_mentee_relationships table
CREATE TABLE IF NOT EXISTS mentor_mentee_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'paused')),
  assigned_date timestamptz NOT NULL DEFAULT now(),
  completion_date timestamptz,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, mentee_id, course_name)
);

-- Enable RLS
ALTER TABLE mentor_mentee_relationships ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_mentor_id ON mentor_mentee_relationships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_mentee_id ON mentor_mentee_relationships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_mentor_mentee ON mentor_mentee_relationships(mentor_id, mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_status ON mentor_mentee_relationships(status);

-- RLS Policies

-- Mentors can view and manage their own mentee relationships
CREATE POLICY "Mentors can view own mentee relationships"
  ON mentor_mentee_relationships
  FOR SELECT
  TO authenticated
  USING (
    mentor_id = auth.uid() OR
    mentee_id = auth.uid()
  );

-- Mentors can insert new mentee relationships
CREATE POLICY "Mentors can create mentee relationships"
  ON mentor_mentee_relationships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Mentor'
    )
  );

-- Mentors can update their own mentee relationships
CREATE POLICY "Mentors can update own mentee relationships"
  ON mentor_mentee_relationships
  FOR UPDATE
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

-- Mentors can delete their own mentee relationships
CREATE POLICY "Mentors can delete own mentee relationships"
  ON mentor_mentee_relationships
  FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

-- Admins can manage all relationships
CREATE POLICY "Admins can manage all mentor mentee relationships"
  ON mentor_mentee_relationships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Service role can manage all relationships
CREATE POLICY "Service role can manage all mentor mentee relationships"
  ON mentor_mentee_relationships
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_mentor_mentee_relationships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mentor_mentee_relationships_updated_at
  BEFORE UPDATE ON mentor_mentee_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_mentee_relationships_updated_at();