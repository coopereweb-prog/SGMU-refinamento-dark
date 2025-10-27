CREATE POLICY "Admins and Ops Managers can update all orders" ON public.orders
FOR UPDATE TO authenticated
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'operations_manager'::user_role])))));