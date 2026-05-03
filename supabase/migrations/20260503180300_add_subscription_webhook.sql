-- 1. Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_net" CASCADE;

-- 2. Create a function to handle the HTTP request using pg_net
CREATE OR REPLACE FUNCTION public.notify_subscription_request()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://rgucydqdqfwjnkveibhr.supabase.co/functions/v1/subscription-notifier',
      headers := '{"Content-Type":"application/json", "Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndWN5ZHFkcWZ3am5rdmVpYmhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyNDIzMywiZXhwIjoyMDkzMjAwMjMzfQ.RtBWM7wWIs-KcW71k5bjOL51g7GTOen6-8QDhVq7lsc"}'::jsonb,
      body := jsonb_build_object('record', row_to_json(NEW), 'type', 'INSERT')
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the webhook trigger
DROP TRIGGER IF EXISTS "on_subscription_request_created" ON "public"."subscription_requests";
CREATE TRIGGER "on_subscription_request_created"
AFTER INSERT ON "public"."subscription_requests"
FOR EACH ROW
EXECUTE FUNCTION public.notify_subscription_request();
