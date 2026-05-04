-- Enable the pg_cron extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Create the function that will perform the reset
CREATE OR REPLACE FUNCTION public.reset_daily_tokens()
RETURNS void AS $$
BEGIN
  -- Reset tokens to 10 for all users on the basic plan
  UPDATE public.profiles
  SET tokens = 10
  WHERE plan_type = 'basic';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the job to run every day at midnight (UTC)
-- The schedule format is: minute (0) hour (0) day-of-month (*) month (*) day-of-week (*)
SELECT cron.schedule(
  'daily-token-reset',
  '0 0 * * *',
  'SELECT public.reset_daily_tokens();'
);
