CREATE POLICY "Field technicians can update their assigned tasks"
ON public.installation_tasks
FOR UPDATE TO authenticated
USING (auth.uid() = assigned_technician_id);