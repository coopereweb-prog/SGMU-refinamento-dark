CREATE POLICY "Admins and Ops Managers can update all tasks simple" ON public.installation_tasks
FOR UPDATE TO authenticated
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'operations_manager')
);