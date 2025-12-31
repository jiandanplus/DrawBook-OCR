-- Fix: Ensure user_files RLS policies allow UPDATE
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on user_files (if not already enabled)
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to view their own files
DROP POLICY IF EXISTS "Users can view own files" ON user_files;
CREATE POLICY "Users can view own files" ON user_files
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Allow users to insert their own files
DROP POLICY IF EXISTS "Users can insert own files" ON user_files;
CREATE POLICY "Users can insert own files" ON user_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to update their own files (CRITICAL for saving OCR results)
DROP POLICY IF EXISTS "Users can update own files" ON user_files;
CREATE POLICY "Users can update own files" ON user_files
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Allow users to delete their own files
DROP POLICY IF EXISTS "Users can delete own files" ON user_files;
CREATE POLICY "Users can delete own files" ON user_files
  FOR DELETE USING (auth.uid() = user_id);

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'user_files';
