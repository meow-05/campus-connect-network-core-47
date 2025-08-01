
-- Add the missing target_semesters column to notices table
ALTER TABLE public.notices 
ADD COLUMN target_semesters integer[];

-- Update the RLS policies to ensure platform admins can create notices for any college
DROP POLICY IF EXISTS "Faculty create notices for their college" ON public.notices;

-- Create improved RLS policies
CREATE POLICY "Faculty create notices for their college" 
ON public.notices 
FOR INSERT 
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty' AND 
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Platform admin create notices for any college" 
ON public.notices 
FOR INSERT 
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);

-- Fix the SELECT policies to ensure platform admins see all notices
DROP POLICY IF EXISTS "Faculty view college notices" ON public.notices;

CREATE POLICY "Faculty view college notices" 
ON public.notices 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty' AND 
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Platform admin view all notices" 
ON public.notices 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);

-- Add students and mentors view policy for targeted notices
CREATE POLICY "Students and mentors view targeted notices" 
ON public.notices 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('student', 'mentor') AND
  college_id = (SELECT college_id FROM users WHERE id = auth.uid()) AND
  (SELECT role FROM users WHERE id = auth.uid()) = ANY(target_roles)
);
