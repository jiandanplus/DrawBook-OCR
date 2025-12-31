-- Daily Reward System
-- Run this in Supabase SQL Editor

-- 1. Add last_daily_reward column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_daily_reward TIMESTAMP WITH TIME ZONE;

-- 2. Create RPC function to check and claim daily reward
CREATE OR REPLACE FUNCTION claim_daily_reward(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_last_reward TIMESTAMP WITH TIME ZONE;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_reward_amount INTEGER := 10;
  v_new_balance INTEGER;
BEGIN
  -- Get user's last reward time
  SELECT last_daily_reward INTO v_last_reward
  FROM profiles
  WHERE id = p_user_id;

  -- Check if already claimed today (using server time)
  -- If last_reward is null, they can claim.
  -- If last_reward is NOT today (in UTC or local timezone as appropriate), they can claim.
  IF v_last_reward IS NULL OR DATE(v_last_reward) < DATE(v_now) THEN
    
    -- Update profile: add balance and set last_daily_reward
    UPDATE profiles
    SET balance_pages = balance_pages + v_reward_amount,
        last_daily_reward = v_now,
        updated_at = v_now
    WHERE id = p_user_id
    RETURNING balance_pages INTO v_new_balance;

    -- Return success
    RETURN json_build_object(
      'success', true,
      'amount', v_reward_amount,
      'new_balance', v_new_balance,
      'message', 'Daily reward claimed'
    );
  ELSE
    -- Already claimed
    RETURN json_build_object(
      'success', false,
      'amount', 0,
      'message', 'Already claimed today'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION claim_daily_reward TO authenticated;

SELECT 'Daily reward system setup complete!' AS status;
