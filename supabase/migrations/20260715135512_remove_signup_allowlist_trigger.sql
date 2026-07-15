-- Remove the BEFORE INSERT trigger that blocks signup
DROP TRIGGER IF EXISTS enforce_signup_allowlist ON auth.users;
DROP FUNCTION IF EXISTS public.check_signup_allowed();
