CREATE POLICY "Admins and Ops Managers can update tasks" ON public.installation_tasks
FOR UPDATE TO authenticated
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'operations_manager'::text]));