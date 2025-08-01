-- Fix infinite recursion in RLS policies by using security definer functions
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Faculty and mentors can view users in their college" ON public.users;
DROP POLICY IF EXISTS "Platform admin can view all users" ON public.users;

-- Create a security definer function to get current user role and college
CREATE OR REPLACE FUNCTION public.get_current_user_role_and_college()
RETURNS TABLE(role user_role, college_id uuid)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT u.role, u.college_id 
  FROM users u 
  WHERE u.id = auth.uid();
$$;

-- Create safe RLS policies using the security definer function
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Faculty and mentors can view users in their college" ON public.users
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.get_current_user_role_and_college() AS user_info
    WHERE user_info.role IN ('faculty', 'mentor') 
    AND (user_info.college_id = users.college_id OR user_info.role = 'mentor')
  )
);

CREATE POLICY "Platform admin can view all users" ON public.users
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.get_current_user_role_and_college() AS user_info
    WHERE user_info.role = 'platform_admin'
  )
);