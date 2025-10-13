-- Drop existing policies if they exist to ensure this script can be re-run safely.
DROP POLICY IF EXISTS "Allow full access for admins and ops managers" ON public.installation_tasks;
DROP POLICY IF EXISTS "Allow technicians to view their assigned tasks" ON public.installation_tasks;
DROP POLICY IF EXISTS "Allow technicians to update their assigned tasks" ON public.installation_tasks;

-- 1. Policy for Admins and Operations Managers
-- This policy grants full permissions (SELECT, INSERT, UPDATE, DELETE) to users
-- whose role in the 'profiles' table is either 'admin' or 'operations_manager'.
CREATE POLICY "Allow full access for admins and ops managers"
ON public.installation_tasks
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'operations_manager')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'operations_manager')
);

-- 2. Policy for Field Technicians to view their tasks
-- This policy allows users with the 'field_technician' role to SELECT (view)
-- only the tasks where the 'assigned_technician_id' matches their own user ID.
CREATE POLICY "Allow technicians to view their assigned tasks"
ON public.installation_tasks
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'field_technician'
  AND assigned_technician_id = auth.uid()
);

-- 3. Policy for Field Technicians to update their tasks
-- This policy allows users with the 'field_technician' role to UPDATE
-- tasks that are assigned to them. The WITH CHECK clause ensures they cannot
-- re-assign the task to someone else.
CREATE POLICY "Allow technicians to update their assigned tasks"
ON public.installation_tasks
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'field_technician'
  AND assigned_technician_id = auth.uid()
)
WITH CHECK (
  assigned_technician_id = auth.uid()
);

-- Add comments for better documentation and understanding of the policies.
COMMENT ON POLICY "Allow full access for admins and ops managers" ON public.installation_tasks IS 'Admins and Operations Managers have unrestricted access to all installation tasks.';
COMMENT ON POLICY "Allow technicians to view their assigned tasks" ON public.installation_tasks IS 'Field Technicians can only see the tasks that are specifically assigned to them.';
COMMENT ON POLICY "Allow technicians to update their assigned tasks" ON public.installation_tasks IS 'Field Technicians can update the status, photos, and notes of their own assigned tasks.';