-- Permitir que qualquer usuário autenticado visualize (SELECT)
CREATE POLICY "Allow authenticated read access to installation photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'installation-photos');

-- Permitir que técnicos de campo e administradores façam upload/substituição (INSERT/UPDATE)
CREATE POLICY "Allow field technicians and admins to upload installation photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'installation-photos' AND 
  (SELECT public.get_current_user_role()) = ANY (ARRAY['field_technician'::text, 'admin'::text, 'operations_manager'::text])
);

CREATE POLICY "Allow field technicians and admins to update installation photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'installation-photos' AND 
  (SELECT public.get_current_user_role()) = ANY (ARRAY['field_technician'::text, 'admin'::text, 'operations_manager'::text])
);