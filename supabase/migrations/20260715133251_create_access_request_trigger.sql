/*
# DSSMA Digital — Auto-create access request on signup + seed leader approval

## Overview
1. Creates a trigger function that automatically inserts a row into access_requests
   when a new user signs up (INSERT on auth.users).
2. Seeds the leader (aguiasistemas@gmail.com) with an 'aprovado' access request so
   they can log in immediately without needing approval.

## Security Changes
- Adds a SECURITY DEFINER function (access_requests schema) that runs as the owner
  to insert into access_requests when auth.users gets a new row.
- Attaches the function as a trigger AFTER INSERT on auth.users.
*/

-- Function to auto-create access request on signup
CREATE OR REPLACE FUNCTION public.handle_new_access_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Don't create a request if one already exists for this user
  IF NOT EXISTS (SELECT 1 FROM public.access_requests WHERE user_id = NEW.id) THEN
    INSERT INTO public.access_requests (user_id, email, status)
    VALUES (NEW.id, NEW.email, 'pendente');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: fires after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_access_request();

-- Seed the leader as already approved
INSERT INTO public.access_requests (user_id, email, status, reviewed_by, reviewed_at)
SELECT id, email, 'aprovado', id, now()
FROM auth.users
WHERE email = 'aguiasistemas@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.access_requests WHERE user_id = auth.users.id
);