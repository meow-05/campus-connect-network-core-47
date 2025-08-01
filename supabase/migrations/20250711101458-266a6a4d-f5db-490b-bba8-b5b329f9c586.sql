
-- Enable RLS on colleges table if not already enabled
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Create policy for platform admins to read all colleges
CREATE POLICY "Platform admin can read all colleges"
ON public.colleges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'platform_admin'
  )
);

-- Create policy for faculty to read their own college
CREATE POLICY "Faculty can read their college"
ON public.colleges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND college_id = colleges.id
    AND role IN ('faculty')
  )
);

-- Create policy for students and mentors to read their college
CREATE POLICY "Students and mentors can read their college"
ON public.colleges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND college_id = colleges.id
    AND role IN ('student', 'mentor')
  )
);
