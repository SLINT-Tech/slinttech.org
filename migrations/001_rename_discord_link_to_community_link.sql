-- Migration: Rename discord_link to community_link
-- Description: Renames the discord_link column to community_link in user_profiles table
--              to make it more generic and support different collaboration platforms (Slack, Discord, etc.)
-- Date: 2025-12-11

-- Rename the column
ALTER TABLE user_profiles
RENAME COLUMN discord_link TO community_link;

-- Add comment explaining the column purpose
COMMENT ON COLUMN user_profiles.community_link IS 'Link to community collaboration platform (Slack, Discord, Teams, etc.)';
