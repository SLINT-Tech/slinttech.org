-- Migration: Add notifications table
-- Description: Creates the notifications table for real-time notification system

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  reference_type TEXT,
  reference_id UUID,
  metadata TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Comment on table
COMMENT ON TABLE notifications IS 'Stores user notifications for real-time notification system';
COMMENT ON COLUMN notifications.type IS 'Notification type: task_submitted, task_reviewed, message_received, course_enrolled';
COMMENT ON COLUMN notifications.reference_type IS 'Type of referenced entity: task, course, message, or null';
COMMENT ON COLUMN notifications.reference_id IS 'ID of the referenced entity for navigation';
COMMENT ON COLUMN notifications.metadata IS 'JSON string containing additional notification data';
