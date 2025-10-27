CREATE POLICY "Admins and Ops Managers can update all tasks" ON public.installation_tasks
FOR UPDATE TO authenticated
USING (EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'operations_manager')
));