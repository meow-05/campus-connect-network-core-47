-- Enable RLS on college_departments table
ALTER TABLE college_departments ENABLE ROW LEVEL SECURITY;

-- Allow faculty, mentors, students, and platform admins to read departments in their college
CREATE POLICY "Users can read departments in their college" 
ON college_departments 
FOR SELECT 
USING (
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
  OR (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);

-- Allow platform admins to manage all departments
CREATE POLICY "Platform admins can manage all departments"
ON college_departments
FOR ALL
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin');