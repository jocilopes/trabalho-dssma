/*
# DSSMA Digital — Switch RLS to authenticated-only

## Overview
Now that the app has a login screen, RLS policies must require authentication.
Previously all tables allowed anon access. Now only authenticated users can CRUD.

## Security Changes
- All 4 tables (setores, temas, dialogos, participantes) policies changed
  from `TO anon, authenticated` to `TO authenticated`.
- Ownership is shared (no user_id scoping) since this is an organizational tool
  where all authenticated users manage the same DDS data.
*/

-- Setores
DROP POLICY IF EXISTS "anon_select_setores" ON setores;
CREATE POLICY "auth_select_setores" ON setores FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_setores" ON setores;
CREATE POLICY "auth_insert_setores" ON setores FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_setores" ON setores;
CREATE POLICY "auth_update_setores" ON setores FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_setores" ON setores;
CREATE POLICY "auth_delete_setores" ON setores FOR DELETE
  TO authenticated USING (true);

-- Temas
DROP POLICY IF EXISTS "anon_select_temas" ON temas;
CREATE POLICY "auth_select_temas" ON temas FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_temas" ON temas;
CREATE POLICY "auth_insert_temas" ON temas FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_temas" ON temas;
CREATE POLICY "auth_update_temas" ON temas FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_temas" ON temas;
CREATE POLICY "auth_delete_temas" ON temas FOR DELETE
  TO authenticated USING (true);

-- Dialogos
DROP POLICY IF EXISTS "anon_select_dialogos" ON dialogos;
CREATE POLICY "auth_select_dialogos" ON dialogos FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_dialogos" ON dialogos;
CREATE POLICY "auth_insert_dialogos" ON dialogos FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_dialogos" ON dialogos;
CREATE POLICY "auth_update_dialogos" ON dialogos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_dialogos" ON dialogos;
CREATE POLICY "auth_delete_dialogos" ON dialogos FOR DELETE
  TO authenticated USING (true);

-- Participantes
DROP POLICY IF EXISTS "anon_select_participantes" ON participantes;
CREATE POLICY "auth_select_participantes" ON participantes FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_participantes" ON participantes;
CREATE POLICY "auth_insert_participantes" ON participantes FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_participantes" ON participantes;
CREATE POLICY "auth_update_participantes" ON participantes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_participantes" ON participantes;
CREATE POLICY "auth_delete_participantes" ON participantes FOR DELETE
  TO authenticated USING (true);
