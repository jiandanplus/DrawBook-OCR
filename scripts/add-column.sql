-- Fix: Add missing file_name column to usage_logs
-- Run this in Supabase SQL Editor

ALTER TABLE usage_logs 
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usage_logs';
