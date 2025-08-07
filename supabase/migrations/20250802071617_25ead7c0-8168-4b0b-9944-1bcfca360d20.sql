-- Fix skills table RLS policies to allow students to create skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all skills
CREATE POLICY "Anyone can read skills" 
ON public.skills 
FOR SELECT 
USING (true);

-- Allow students to create skills for their college
CREATE POLICY "Students can create skills" 
ON public.skills 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'student'::user_role
    AND (skills.college_id IS NULL OR users.college_id = skills.college_id)
  )
);

-- Allow faculty to manage skills for their college
CREATE POLICY "Faculty can manage college skills" 
ON public.skills 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'faculty'::user_role
    AND users.college_id = skills.college_id
  )
);

-- Allow platform admins to manage all skills
CREATE POLICY "Platform admin manages all skills" 
ON public.skills 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'platform_admin'::user_role
  )
);