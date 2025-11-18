/*
  # Update user profiles trigger to handle specialization

  1. Updates
    - Modify the handle_new_user trigger function to properly set specialization for mentors
    - Ensure career_path is used as specialization for mentors
    - Keep existing functionality for all other fields

  2. Security
    - No changes to existing RLS policies
    - Maintains all current security settings
*/

-- Update the trigger function to handle specialization properly
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