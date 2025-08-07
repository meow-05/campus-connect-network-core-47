-- Add RLS policy to allow users to view profiles of suggested connections
-- This allows students to view profiles of other users in their college for connection purposes
CREATE POLICY "Students can view profiles in their college for connections" 
ON users 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM get_current_user_role_and_college() user_info(role, college_id)
    WHERE user_info.role = 'student'::user_role 
    AND (
      -- Allow viewing users in same college
      user_info.college_id = users.college_id
      -- Allow viewing users who appear in their suggested connections
      OR users.id IN (
        SELECT suggested.id 
        FROM get_suggested_connections(auth.uid()) suggested
      )
    )
  )
);