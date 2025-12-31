-- Fix: Create a SECURITY DEFINER RPC function to log usage and decrement balance
-- Run this in Supabase SQL Editor

-- Combined RPC function that both logs usage AND decrements balance
CREATE OR REPLACE FUNCTION log_usage_and_decrement(
  p_user_id UUID, 
  p_pages INTEGER,
  p_file_name TEXT
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- 1. Insert usage log
  INSERT INTO usage_logs (user_id, pages_processed, file_name)
  VALUES (p_user_id, p_pages, p_file_name);
  
  -- 2. Decrement balance
  UPDATE profiles 
  SET balance_pages = balance_pages - p_pages,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING balance_pages INTO new_balance;
  
  RETURN COALESCE(new_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_usage_and_decrement TO authenticated;

SELECT 'RPC function created!' AS status;
