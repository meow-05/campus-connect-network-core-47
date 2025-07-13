-- Update users table RLS policy to allow faculty/mentors/platform_admin to view other users' basic info
-- This is necessary for the students list functionality

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Faculty and mentors can view users in their college" ON public.users
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role IN ('faculty', 'mentor') 
    AND (u.college_id = users.college_id OR u.role = 'mentor')
  )
);

CREATE POLICY "Platform admin can view all users" ON public.users
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'platform_admin'
  )
);