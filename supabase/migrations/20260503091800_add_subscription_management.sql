-- Add expiration column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

-- Create subscription requests table
CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'upgrade', 'cancel'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own requests" ON public.subscription_requests;
CREATE POLICY "Users can view their own requests" ON public.subscription_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own requests" ON public.subscription_requests;
CREATE POLICY "Users can create their own requests" ON public.subscription_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own requests" ON public.subscription_requests;
CREATE POLICY "Users can update their own requests" ON public.subscription_requests
  FOR UPDATE USING (auth.uid() = user_id);
