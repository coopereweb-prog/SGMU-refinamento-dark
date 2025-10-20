DROP POLICY IF EXISTS "Users can update their own profile (no role change)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;