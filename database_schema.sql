-- =====================================================
-- SlintTech Mentorship Platform - Complete Database Schema
-- =====================================================
-- This file contains all tables, relationships, indexes,
-- functions, and triggers for the platform.
--
-- IMPORTANT: This schema is designed for standalone PostgreSQL
-- and uses application-level authentication.
--
-- SECURITY NOTE: All access control and permissions are handled
-- at the application/API level. No RLS policies are used.
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
-- This is the primary user authentication and profile table

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
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
-- TABLE: contract_files
-- =====================================================
-- Stores metadata for contract files stored in cloud storage
-- Storage agnostic: supports Amazon S3, Firebase Storage, etc.
-- Files are stored in external cloud storage, not in the database

CREATE TABLE IF NOT EXISTS contract_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  file_type text NOT NULL,
  storage_provider text NOT NULL CHECK (storage_provider IN ('s3', 'firebase', 'gcs', 'azure', 'other')),
  storage_key text NOT NULL,
  storage_bucket text NOT NULL,
  storage_url text,
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'completed', 'failed')),
  uploaded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(storage_provider, storage_key)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
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

-- contract_files indexes
CREATE INDEX IF NOT EXISTS idx_contract_files_user_id ON contract_files(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_files_storage_key ON contract_files(storage_key);
CREATE INDEX IF NOT EXISTS idx_contract_files_storage_provider ON contract_files(storage_provider);
CREATE INDEX IF NOT EXISTS idx_contract_files_upload_status ON contract_files(upload_status);

-- =====================================================
-- FUNCTIONS
-- =====================================================

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

DROP TRIGGER IF EXISTS update_contract_files_updated_at ON contract_files;
CREATE TRIGGER update_contract_files_updated_at
  BEFORE UPDATE ON contract_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update course enrolled count
DROP TRIGGER IF EXISTS update_course_count_on_enrollment ON course_enrollments;
CREATE TRIGGER update_course_count_on_enrollment
  AFTER INSERT OR DELETE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_course_enrolled_count();

-- =====================================================
-- COMMENTS
-- =====================================================

-- Add comments explaining table purposes
COMMENT ON TABLE user_profiles IS 'Main user authentication and profile table. Stores credentials and profile information for all platform users.';
COMMENT ON COLUMN user_profiles.password_hash IS 'Hashed password using bcrypt or similar. NEVER store plain text passwords.';
COMMENT ON COLUMN user_profiles.email IS 'User email address. Used for authentication and communication.';

COMMENT ON TABLE contract_files IS 'Stores metadata for contract files stored in cloud storage. Storage agnostic - supports multiple providers (S3, Firebase, GCS, Azure, etc.).';
COMMENT ON COLUMN contract_files.storage_provider IS 'Cloud storage provider: s3 (Amazon S3), firebase (Firebase Storage), gcs (Google Cloud Storage), azure (Azure Blob Storage), other (custom provider)';
COMMENT ON COLUMN contract_files.storage_key IS 'The storage object key/path, typically in format: {user_id}/{timestamp}_{filename}';
COMMENT ON COLUMN contract_files.storage_bucket IS 'The bucket/container name where the file is stored';
COMMENT ON COLUMN contract_files.storage_url IS 'Optional: Full URL to access the file (can be a signed URL or public URL)';
COMMENT ON COLUMN contract_files.upload_status IS 'Upload status: pending (uploading), completed (successful), failed (error occurred)';

-- =====================================================
-- IMPORTANT IMPLEMENTATION NOTES
-- =====================================================
--
-- 1. APPLICATION-LEVEL AUTHENTICATION:
--    Your application must handle:
--    - User registration (hash passwords using bcrypt, argon2, or similar)
--    - User login (verify password hash)
--    - Session management (JWT tokens, sessions, etc.)
--
-- 2. SECURITY & ACCESS CONTROL:
--    All security and access control is handled at the application/API level.
--    Your API endpoints should:
--    - Verify user authentication via JWT tokens or sessions
--    - Check user permissions based on their role (Admin, Mentor, Mentee)
--    - Filter data based on user relationships (e.g., mentors see only their mentees)
--    - Validate that users can only modify their own data
--
--    Example checks to implement in your API:
--    - Mentees can only view/update their own profiles
--    - Mentors can only view/update their assigned mentees
--    - Mentors can only manage their own courses and lessons
--    - Admins have full access to all resources
--
-- 3. CLOUD STORAGE INTEGRATION:
--    - Use appropriate SDK for your chosen storage provider:
--      * Amazon S3: AWS SDK (storage_provider = 's3')
--      * Firebase Storage: Firebase SDK (storage_provider = 'firebase')
--      * Google Cloud Storage: GCS SDK (storage_provider = 'gcs')
--      * Azure Blob Storage: Azure SDK (storage_provider = 'azure')
--    - Store file metadata (storage_key, storage_bucket, storage_provider) in contract_files table
--    - Generate signed URLs for secure file access (store in storage_url if needed)
--    - Implement file access control in your API endpoints
--    - The schema is storage-agnostic, allowing you to switch providers without database changes
--
-- 4. PASSWORD SECURITY:
--    - NEVER store plain text passwords
--    - Use bcrypt, argon2, or scrypt for password hashing
--    - Implement password strength requirements in your application
--    - Consider implementing rate limiting for login attempts
--
-- 5. API ENDPOINT SECURITY:
--    Since there are no RLS policies, your API must enforce all security rules:
--    - Authentication: Verify JWT/session tokens on every request
--    - Authorization: Check user roles and permissions
--    - Data filtering: Return only data the user is allowed to see
--    - Input validation: Validate and sanitize all user inputs
--    - Rate limiting: Prevent abuse and brute force attacks
--
-- =====================================================
-- END OF SCHEMA
-- =====================================================
