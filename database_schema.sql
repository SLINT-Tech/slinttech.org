-- =====================================================
-- SlintTech Mentorship Platform - Complete Database Schema
-- =====================================================
-- This file contains all tables, relationships, indexes,
-- functions, triggers, and RLS policies for the platform.
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_profiles
-- =====================================================
-- Stores user profile information for all users (Mentees, Mentors, Admins)
-- References auth.users from Supabase Auth

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

-- =====================================================
-- TABLE: mentor_mentee_relationships
-- =====================================================
-- Tracks the relationships between mentors and mentees
-- including course assignments and progress

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

-- =====================================================
-- TABLE: courses
-- =====================================================
-- Stores course information created by mentors

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  enrolled_mentees_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, name)
);

-- =====================================================
-- TABLE: course_enrollments
-- =====================================================
-- Tracks which mentees are enrolled in which courses

CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, mentee_id)
);

-- =====================================================
-- TABLE: lessons
-- =====================================================
-- Stores lesson content created by mentors for their courses

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  link text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- TABLE: lesson_progress
-- =====================================================
-- Tracks mentee progress on individual lessons

CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lesson_id, mentee_id)
);

-- =====================================================
-- TABLE: tasks
-- =====================================================
-- Stores tasks/assignments created by mentors for mentees

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- TABLE: task_submissions
-- =====================================================
-- Stores mentee submissions for tasks with mentor feedback

CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  submission_link text,
  submission_notes text,
  submitted_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  mentor_feedback text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(task_id, mentee_id)
);

-- =====================================================
-- TABLE: announcements
-- =====================================================
-- Stores announcements that can be sent to mentees

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  target_audience text NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'mentees', 'mentors', 'specific')),
  target_course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published boolean DEFAULT false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- TABLE: messages
-- =====================================================
-- Stores messages between mentors and mentees

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject text,
  content text NOT NULL,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_membership_paid ON user_profiles(membership_paid);

-- mentor_mentee_relationships indexes
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_mentor_id ON mentor_mentee_relationships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_mentee_id ON mentor_mentee_relationships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_mentor_mentee ON mentor_mentee_relationships(mentor_id, mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mentee_relationships_status ON mentor_mentee_relationships(status);

-- courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_mentor_id ON courses(mentor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- course_enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_mentee_id ON course_enrollments(mentee_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- lessons indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_mentor_id ON lessons(mentor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);

-- lesson_progress indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_mentee_id ON lesson_progress(mentee_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(completed);

-- tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_mentor_id ON tasks(mentor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- task_submissions indexes
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_mentee_id ON task_submissions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);

-- announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_mentor_id ON announcements(mentor_id);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published);
CREATE INDEX IF NOT EXISTS idx_announcements_target_course_id ON announcements(target_course_id);

-- messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle user profile creation when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    membership_category,
    career_path,
    role,
    specialization,
    status,
    membership_enabled,
    membership_amount,
    membership_paid
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'membership_category', ''),
    COALESCE(NEW.raw_user_meta_data->>'career_path', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Mentee'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'Mentee') = 'Mentor'
      THEN COALESCE(NEW.raw_user_meta_data->>'career_path', '')
      ELSE NULL
    END,
    'pending',
    false,
    30.00,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update course enrolled mentees count
CREATE OR REPLACE FUNCTION update_course_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE courses
    SET enrolled_mentees_count = enrolled_mentees_count + 1
    WHERE id = NEW.course_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE courses
    SET enrolled_mentees_count = enrolled_mentees_count - 1
    WHERE id = OLD.course_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers to update updated_at timestamp
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentor_mentee_relationships_updated_at ON mentor_mentee_relationships;
CREATE TRIGGER update_mentor_mentee_relationships_updated_at
  BEFORE UPDATE ON mentor_mentee_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER update_course_enrollments_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_submissions_updated_at ON task_submissions;
CREATE TRIGGER update_task_submissions_updated_at
  BEFORE UPDATE ON task_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update course enrolled count
DROP TRIGGER IF EXISTS update_course_count_on_enrollment ON course_enrollments;
CREATE TRIGGER update_course_count_on_enrollment
  AFTER INSERT OR DELETE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_course_enrolled_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_mentee_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: user_profiles
-- =====================================================

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

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- RLS POLICIES: mentor_mentee_relationships
-- =====================================================

CREATE POLICY "Mentors and mentees can view own relationships"
  ON mentor_mentee_relationships
  FOR SELECT
  TO authenticated
  USING (
    mentor_id = auth.uid() OR
    mentee_id = auth.uid()
  );

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

CREATE POLICY "Mentors can update own mentee relationships"
  ON mentor_mentee_relationships
  FOR UPDATE
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Mentors can delete own mentee relationships"
  ON mentor_mentee_relationships
  FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Service role can manage all mentor mentee relationships"
  ON mentor_mentee_relationships
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: courses
-- =====================================================

CREATE POLICY "Anyone can view active courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Mentors can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Mentor'
    )
  );

CREATE POLICY "Mentors can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Mentors can delete own courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Service role can manage all courses"
  ON courses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: course_enrollments
-- =====================================================

CREATE POLICY "Mentees can view own enrollments"
  ON course_enrollments
  FOR SELECT
  TO authenticated
  USING (
    mentee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_enrollments.course_id
      AND courses.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can enroll mentees in their courses"
  ON course_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_enrollments.course_id
      AND courses.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update enrollments in their courses"
  ON course_enrollments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_enrollments.course_id
      AND courses.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all enrollments"
  ON course_enrollments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: lessons
-- =====================================================

CREATE POLICY "Mentees can view lessons in their enrolled courses"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (
    mentor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_enrollments.course_id = lessons.course_id
      AND course_enrollments.mentee_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can create lessons in their courses"
  ON lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update own lessons"
  ON lessons
  FOR UPDATE
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Mentors can delete own lessons"
  ON lessons
  FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Service role can manage all lessons"
  ON lessons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: lesson_progress
-- =====================================================

CREATE POLICY "Mentees can view own lesson progress"
  ON lesson_progress
  FOR SELECT
  TO authenticated
  USING (
    mentee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = lesson_progress.lesson_id
      AND lessons.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentees can create own lesson progress"
  ON lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "Mentees can update own lesson progress"
  ON lesson_progress
  FOR UPDATE
  TO authenticated
  USING (mentee_id = auth.uid())
  WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "Service role can manage all lesson progress"
  ON lesson_progress
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: tasks
-- =====================================================

CREATE POLICY "Mentees can view tasks in their enrolled courses"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    mentor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_enrollments.course_id = tasks.course_id
      AND course_enrollments.mentee_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can create tasks in their courses"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = tasks.course_id
      AND courses.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Mentors can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Service role can manage all tasks"
  ON tasks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: task_submissions
-- =====================================================

CREATE POLICY "Mentees and mentors can view submissions"
  ON task_submissions
  FOR SELECT
  TO authenticated
  USING (
    mentee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_submissions.task_id
      AND tasks.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentees can create own submissions"
  ON task_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "Mentees can update own submissions"
  ON task_submissions
  FOR UPDATE
  TO authenticated
  USING (
    mentee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_submissions.task_id
      AND tasks.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all submissions"
  ON task_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: announcements
-- =====================================================

CREATE POLICY "Users can view published announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Mentors can create announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('Mentor', 'Admin')
    )
  );

CREATE POLICY "Mentors can update own announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "Mentors can delete own announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Service role can manage all announcements"
  ON announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: messages
-- =====================================================

CREATE POLICY "Users can view own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update message read status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Service role can manage all messages"
  ON messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- TABLE: contract_files
-- =====================================================
-- Stores metadata for contract files stored in Amazon S3
-- Files are NOT stored in Supabase Storage

CREATE TABLE IF NOT EXISTS contract_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  file_type text NOT NULL,
  s3_key text NOT NULL UNIQUE,
  s3_bucket text NOT NULL,
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'completed', 'failed')),
  uploaded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- contract_files indexes
CREATE INDEX IF NOT EXISTS idx_contract_files_user_id ON contract_files(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_files_s3_key ON contract_files(s3_key);
CREATE INDEX IF NOT EXISTS idx_contract_files_upload_status ON contract_files(upload_status);

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_contract_files_updated_at ON contract_files;
CREATE TRIGGER update_contract_files_updated_at
  BEFORE UPDATE ON contract_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on contract_files
ALTER TABLE contract_files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: contract_files
-- =====================================================

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

CREATE POLICY "Service role can manage all contract files"
  ON contract_files
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments explaining the table's purpose
COMMENT ON TABLE contract_files IS 'Stores metadata for contract files stored in Amazon S3. Files are not stored in Supabase Storage.';
COMMENT ON COLUMN contract_files.s3_key IS 'The S3 object key/path in format: {user_id}/{timestamp}_{filename}';
COMMENT ON COLUMN contract_files.s3_bucket IS 'The Amazon S3 bucket name where the file is stored';
COMMENT ON COLUMN contract_files.upload_status IS 'Upload status: pending (uploading), completed (successful), failed (error occurred)';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
