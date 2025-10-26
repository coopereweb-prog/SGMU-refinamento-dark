CREATE POLICY "Admins, Ops Managers, and Field Techs can update installation details" ON public.points
FOR UPDATE TO authenticated
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'operations_manager'::text, 'field_technician'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'operations_manager'::text, 'field_technician'::text]));