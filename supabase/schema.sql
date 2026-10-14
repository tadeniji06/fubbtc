-- ==============================================================================
-- Funbtc Web3 Social-Fi Platform — Supabase Schema & Referral Sync
-- ==============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  avatar_url TEXT DEFAULT '/mascot.png',
  is_activated BOOLEAN DEFAULT FALSE,
  balance_usd NUMERIC(10, 2) DEFAULT 0.00,
  points BIGINT DEFAULT 0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  preferred_crypto TEXT,
  check_in_streak INT DEFAULT 0,
  last_check_in_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  has_activated BOOLEAN DEFAULT FALSE,
  commission_earned_usd NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_referred_user UNIQUE (referred_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Profiles
DROP POLICY IF EXISTS "Public can view usernames and referral codes" ON public.profiles;
CREATE POLICY "Public can view usernames and referral codes"
  ON public.profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- 5. RLS Policies for Referrals
DROP POLICY IF EXISTS "Referrers can view their referral squad" ON public.referrals;
CREATE POLICY "Referrers can view their referral squad"
  ON public.referrals
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = referrer_id);

DROP POLICY IF EXISTS "System and authenticated can insert referrals" ON public.referrals;
CREATE POLICY "System and authenticated can insert referrals"
  ON public.referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "System and authenticated can update referrals" ON public.referrals;
CREATE POLICY "System and authenticated can update referrals"
  ON public.referrals
  FOR UPDATE
  TO authenticated
  USING (true);

-- 6. Trigger to automatically create profile and link referral on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref_code TEXT;
  v_referred_by TEXT;
  v_username TEXT;
  v_name TEXT;
  v_referrer_id UUID;
BEGIN
  -- Extract metadata supplied during signUp
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', v_username);
  v_ref_code := COALESCE(NEW.raw_user_meta_data->>'referral_code', 'FBTC-' || UPPER(SUBSTRING(NEW.id::text, 1, 6)));
  v_referred_by := NULLIF(TRIM(NEW.raw_user_meta_data->>'referred_by'), '');

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    username,
    name,
    email,
    referral_code,
    referred_by,
    is_activated,
    balance_usd,
    points
  ) VALUES (
    NEW.id,
    v_username,
    v_name,
    NEW.email,
    v_ref_code,
    v_referred_by,
    FALSE,
    0.00,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  -- If user registered with a referral code, link to the referrer in referrals table
  IF v_referred_by IS NOT NULL THEN
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE UPPER(referral_code) = UPPER(v_referred_by)
    LIMIT 1;

    IF v_referrer_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_id,
        referred_id,
        referral_code,
        has_activated,
        commission_earned_usd
      ) VALUES (
        v_referrer_id,
        NEW.id,
        v_referred_by,
        FALSE,
        0.00
      )
      ON CONFLICT (referred_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Function to handle $5 activation and distribute referral commission
CREATE OR REPLACE FUNCTION public.activate_account_and_credit_referral(
  p_user_id UUID,
  p_crypto TEXT DEFAULT 'USDT'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_ref TEXT;
  v_referrer_id UUID;
  v_already_activated BOOLEAN;
BEGIN
  -- Check current activation status
  SELECT is_activated, referred_by INTO v_already_activated, v_user_ref
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_already_activated IS TRUE THEN
    RETURN json_build_object('success', true, 'message', 'Already activated');
  END IF;

  -- 1. Activate the user and credit $5.00 Welcome Bonus + 5000 points
  UPDATE public.profiles
  SET 
    is_activated = TRUE,
    preferred_crypto = p_crypto,
    balance_usd = balance_usd + 5.00,
    points = points + 5000,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- 2. If referred by an existing user, credit the referrer $1.50 instant commission
  IF v_user_ref IS NOT NULL THEN
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE UPPER(referral_code) = UPPER(v_user_ref)
    LIMIT 1;

    IF v_referrer_id IS NOT NULL THEN
      -- Update referral record
      UPDATE public.referrals
      SET 
        has_activated = TRUE,
        commission_earned_usd = 1.50,
        updated_at = NOW()
      WHERE referred_id = p_user_id;

      -- Credit $1.50 into referrer balance
      UPDATE public.profiles
      SET 
        balance_usd = balance_usd + 1.50,
        updated_at = NOW()
      WHERE id = v_referrer_id;
    END IF;
  END IF;

  RETURN json_build_object('success', true, 'credited_usd', 5.00);
END;
$$;

-- 8. Stored function to handle daily check-in with strict 24-hour calendar date verification
CREATE OR REPLACE FUNCTION public.claim_daily_checkin(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_activated BOOLEAN;
  v_last_check_in_date DATE;
  v_check_in_streak INT;
  v_new_streak INT;
  v_day_number INT;
  v_reward_usd NUMERIC(10, 2);
  v_reward_points INT;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
BEGIN
  -- Select user profile
  SELECT is_activated, last_check_in_date, check_in_streak
  INTO v_is_activated, v_last_check_in_date, v_check_in_streak
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;

  IF v_is_activated IS NOT TRUE THEN
    RETURN json_build_object('success', false, 'error', 'Account must be activated ($5 crypto fee) to claim daily rewards');
  END IF;

  -- CRITICAL: Prevent duplicate claims on the same calendar day!
  IF v_last_check_in_date IS NOT NULL AND v_last_check_in_date = v_today THEN
    RETURN json_build_object('success', false, 'error', 'Already checked in today. Please return tomorrow!');
  END IF;

  -- Calculate streak: consecutive if claimed yesterday, otherwise resets to 1
  IF v_last_check_in_date IS NOT NULL AND v_last_check_in_date = v_yesterday THEN
    v_new_streak := COALESCE(v_check_in_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  -- Cycle day (1 to 7)
  v_day_number := ((v_new_streak - 1) % 7) + 1;

  -- Reward amounts
  CASE v_day_number
    WHEN 1 THEN v_reward_usd := 0.20; v_reward_points := 200;
    WHEN 2 THEN v_reward_usd := 0.25; v_reward_points := 250;
    WHEN 3 THEN v_reward_usd := 0.30; v_reward_points := 300;
    WHEN 4 THEN v_reward_usd := 0.35; v_reward_points := 350;
    WHEN 5 THEN v_reward_usd := 0.40; v_reward_points := 400;
    WHEN 6 THEN v_reward_usd := 0.50; v_reward_points := 500;
    WHEN 7 THEN v_reward_usd := 1.00; v_reward_points := 1000;
    ELSE v_reward_usd := 0.20; v_reward_points := 200;
  END CASE;

  -- Update profile with atomic increment and new check-in date
  UPDATE public.profiles
  SET
    balance_usd = balance_usd + v_reward_usd,
    points = points + v_reward_points,
    check_in_streak = v_new_streak,
    last_check_in_date = v_today,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert history record if table exists
  BEGIN
    INSERT INTO public.daily_check_ins (user_id, day_number, reward_usd, reward_points, check_in_date)
    VALUES (p_user_id, v_day_number, v_reward_usd, v_reward_points, v_today);
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if daily_check_ins table has not been created yet
    NULL;
  END;

  RETURN json_build_object(
    'success', true,
    'day_number', v_day_number,
    'streak', v_new_streak,
    'reward_usd', v_reward_usd,
    'reward_points', v_reward_points,
    'last_check_in_date', v_today
  );
END;
$$;

-- 9. Optional auxiliary tracking tables
CREATE TABLE IF NOT EXISTS public.daily_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  reward_usd NUMERIC(10, 2) NOT NULL,
  reward_points INT NOT NULL,
  check_in_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, check_in_date)
);

CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  reward_usd NUMERIC(10, 2) NOT NULL,
  reward_points INT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_task UNIQUE (user_id, task_id)
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_usd NUMERIC(10, 2) NOT NULL,
  network TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Payment transactions tracking table for real on-chain & manual verification
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL, -- 'walletconnect', 'manual_deposit'
  network TEXT NOT NULL,        -- 'BSC', 'Polygon', 'Ethereum', 'TRC-20', 'Solana', 'Bitcoin'
  crypto_symbol TEXT NOT NULL,  -- 'USDT', 'USDC', 'ETH', 'BNB', 'SOL', 'BTC'
  amount_crypto NUMERIC(18, 8),
  amount_usd NUMERIC(10, 2) DEFAULT 20.00,
  tx_hash TEXT,
  sender_address TEXT,
  recipient_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- RLS for auxiliary tables
ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_check_ins;
CREATE POLICY "Users can view own checkins" ON public.daily_check_ins FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own completed tasks" ON public.user_tasks;
CREATE POLICY "Users can view own completed tasks" ON public.user_tasks FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own completed tasks" ON public.user_tasks;
CREATE POLICY "Users can insert own completed tasks" ON public.user_tasks FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own withdrawal" ON public.withdrawals;
CREATE POLICY "Users can create own withdrawal" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_transactions;
CREATE POLICY "Users can view own payments" ON public.payment_transactions FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can record own payment" ON public.payment_transactions;
CREATE POLICY "Users can record own payment" ON public.payment_transactions FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

-- 11. Stored procedure to atomically activate account upon payment confirmation
CREATE OR REPLACE FUNCTION public.activate_account_with_payment(
  p_user_id UUID,
  p_tx_hash TEXT,
  p_payment_method TEXT,
  p_network TEXT,
  p_crypto TEXT,
  p_sender_address TEXT,
  p_recipient_address TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res JSON;
BEGIN
  -- Record the payment transaction
  INSERT INTO public.payment_transactions (
    user_id,
    payment_method,
    network,
    crypto_symbol,
    tx_hash,
    sender_address,
    recipient_address,
    status,
    confirmed_at
  ) VALUES (
    p_user_id,
    p_payment_method,
    p_network,
    p_crypto,
    p_tx_hash,
    p_sender_address,
    p_recipient_address,
    'confirmed',
    NOW()
  );

  -- Trigger account activation and referral crediting
  SELECT public.activate_account_and_credit_referral(p_user_id, p_crypto) INTO v_res;

  RETURN json_build_object(
    'success', true,
    'activation', v_res,
    'tx_hash', p_tx_hash
  );
END;
$$;

