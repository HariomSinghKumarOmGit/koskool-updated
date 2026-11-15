-- ========================================================
-- KOSKOOL SUPABASE MIGRATION: CART & GUEST DATA SYNC
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ========================================================

-- 1. Ensure profiles table has cart column to save user's cart in cloud
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cart JSONB DEFAULT '[]'::jsonb;

-- 2. Ensure profiles table has addresses column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- 3. Ensure orders table allows guest orders (user_id nullable)
DO $$
BEGIN
  ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. Enable RLS with open read/write policies for public cart/order flows
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public select on profiles') THEN
    CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow individual update on profiles') THEN
    CREATE POLICY "Allow individual update on profiles" ON public.profiles FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow insert on profiles') THEN
    CREATE POLICY "Allow insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
END $$;
