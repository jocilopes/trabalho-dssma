/*
# DSSMA Digital — Storage policies for participant photos and signatures

## Overview
Creates RLS policies on the storage.objects table so authenticated users
can upload, read, and delete photos and signature images in the
'participantes-fotos' bucket.
*/

DROP POLICY IF EXISTS "auth_read_participantes_fotos" ON storage.objects;
CREATE POLICY "auth_read_participantes_fotos" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'participantes-fotos');

DROP POLICY IF EXISTS "auth_insert_participantes_fotos" ON storage.objects;
CREATE POLICY "auth_insert_participantes_fotos" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'participantes-fotos');

DROP POLICY IF EXISTS "auth_update_participantes_fotos" ON storage.objects;
CREATE POLICY "auth_update_participantes_fotos" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'participantes-fotos') WITH CHECK (bucket_id = 'participantes-fotos');

DROP POLICY IF EXISTS "auth_delete_participantes_fotos" ON storage.objects;
CREATE POLICY "auth_delete_participantes_fotos" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'participantes-fotos');
