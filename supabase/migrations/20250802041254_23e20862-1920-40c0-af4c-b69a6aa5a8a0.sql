-- Add INSERT policy for students to create projects
CREATE POLICY "Students can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (
  auth.uid() = team_lead 
  AND 
  EXISTS (
    SELECT 1 
    FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'student'
    AND users.college_id = projects.college_id
  )
);

-- Add SELECT policy for students to view projects in their college
CREATE POLICY "Students can view college projects" 
ON public.projects 
FOR SELECT 
USING (
  college_id = (
    SELECT users.college_id 
    FROM users 
    WHERE users.id = auth.uid()
  ) 
  AND is_draft = false
);