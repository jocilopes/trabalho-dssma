/*
# DSSMA Digital — Access request approval system

## Overview
Creates an access request system where the leader (aguiasistemas@gmail.com)
must approve new user signups before they can access the system.

## New Tables
1. **access_requests** — Pending/approved/rejected access requests
   - `id` (uuid, PK)
   - `user_id` (uuid, FK → auth.users.id ON DELETE CASCADE) — the user who requested access
   - `email` (text, not null) — user email (denormalized for easy listing)
   - `status` (text, not null default 'pendente') — 'pendente' | 'aprovado' | 'reprovado'
   - `requested_at` (timestamptz, default now()) — when the request was made
   - `reviewed_by` (uuid, nullable, FK → auth.users.id) — leader who reviewed
   - `reviewed_at` (timestamptz, nullable) — when it was reviewed

## Security
- RLS enabled on access_requests.
- Any authenticated user can INSERT their own request (for signup flow).
- Any authenticated user can SELECT their own request (to check status).
- Only the leader (aguiasistemas@gmail.com) can SELECT all, UPDATE, or DELETE requests.
  The leader check uses a subquery on auth.users matching the leader's email.
*/

CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
  requested_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert their own access request
DROP POLICY IF EXISTS "insert_own_access_request" ON access_requests;
CREATE POLICY "insert_own_access_request" ON access_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can read their own request OR the leader can read all
DROP POLICY IF EXISTS "select_access_requests" ON access_requests;
CREATE POLICY "select_access_requests" ON access_requests FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'aguiasistemas@gmail.com'
    )
  );

-- Only the leader can update requests (approve/reject)
DROP POLICY IF EXISTS "update_access_requests_leader" ON access_requests;
CREATE POLICY "update_access_requests_leader" ON access_requests FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'aguiasistemas@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'aguiasistemas@gmail.com'
    )
  );

-- Only the leader can delete requests
DROP POLICY IF EXISTS "delete_access_requests_leader" ON access_requests;
CREATE POLICY "delete_access_requests_leader" ON access_requests FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'aguiasistemas@gmail.com'
    )
  );

-- Index for quick lookup by user_id and status
CREATE INDEX IF NOT EXISTS idx_access_requests_user ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);