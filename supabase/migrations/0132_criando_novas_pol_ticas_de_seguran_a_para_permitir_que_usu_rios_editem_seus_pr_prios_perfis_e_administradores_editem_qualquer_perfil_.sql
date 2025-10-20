CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT get_current_user_role()) = 'admin'::text);