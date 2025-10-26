CREATE POLICY "Admins and Ops Managers can view all tasks" ON public.installation_tasks
FOR SELECT TO authenticated
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'operations_manager'::text]));