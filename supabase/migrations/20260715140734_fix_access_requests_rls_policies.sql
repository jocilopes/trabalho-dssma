-- Drop existing policies that hardcode admin email
DROP POLICY IF EXISTS "select_access_requests" ON public.access_requests;
DROP POLICY IF EXISTS "update_access_requests_leader" ON public.access_requests;
DROP POLICY IF EXISTS "delete_access_requests_leader" ON public.access_requests;
DROP POLICY IF EXISTS "insert_own_access_request" ON public.access_requests;

-- Recreate policies using admins table instead of hardcoded email

-- SELECT: users can see their own request; admins can see all
CREATE POLICY "select_access_requests" ON public.access_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid())
  );

-- INSERT: trigger inserts via SECURITY DEFINER (bypasses RLS), but keep policy for direct inserts
CREATE POLICY "insert_own_access_request" ON public.access_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only admins can approve/reject
CREATE POLICY "update_access_requests_leader" ON public.access_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));

-- DELETE: only admins can delete
CREATE POLICY "delete_access_requests_leader" ON public.access_requests
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));
