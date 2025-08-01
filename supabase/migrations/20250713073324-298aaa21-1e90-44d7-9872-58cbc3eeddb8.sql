
-- Add composite constraint to prevent duplicate requests
ALTER TABLE user_connections 
ADD CONSTRAINT unique_user_connection 
UNIQUE (requester_id, receiver_id);

-- Enable Row Level Security on user_connections
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view connections where they are either requester or receiver
CREATE POLICY "Users can view their connections" 
ON user_connections 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Policy: Users can send connection requests
CREATE POLICY "Users can send connection requests" 
ON user_connections 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

-- Policy: Users can update connections where they are receiver (accept/reject)
CREATE POLICY "Users can respond to connection requests" 
ON user_connections 
FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Policy: Users can delete connections where they are either party (remove connection)
CREATE POLICY "Users can remove connections" 
ON user_connections 
FOR DELETE 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Function to get user profile data for connections
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  email TEXT,
  role user_role,
  department_name TEXT,
  college_name TEXT,
  avatar_path TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.display_name,
    u.email,
    u.role,
    CASE 
      WHEN u.role = 'student' THEN cd_student.name
      WHEN u.role = 'faculty' THEN cd_faculty.name
      ELSE NULL
    END as department_name,
    c.name as college_name,
    u.avatar_path
  FROM users u
  LEFT JOIN colleges c ON u.college_id = c.id
  LEFT JOIN students s ON u.id = s.user_id
  LEFT JOIN college_departments cd_student ON s.department_id = cd_student.id
  LEFT JOIN faculty f ON u.id = f.user_id
  LEFT JOIN college_departments cd_faculty ON f.department_id = cd_faculty.id
  WHERE u.id = user_id
    AND u.role IN ('student', 'faculty', 'mentor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get suggested connections
CREATE OR REPLACE FUNCTION get_suggested_connections(current_user_id UUID)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  email TEXT,
  role user_role,
  department_name TEXT,
  college_name TEXT,
  avatar_path TEXT,
  mutual_connections_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH current_user_info AS (
    SELECT u.college_id, s.department_id as student_dept, f.department_id as faculty_dept
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN faculty f ON u.id = f.user_id
    WHERE u.id = current_user_id
  ),
  existing_connections AS (
    SELECT 
      CASE WHEN requester_id = current_user_id THEN receiver_id ELSE requester_id END as connected_user_id
    FROM user_connections 
    WHERE (requester_id = current_user_id OR receiver_id = current_user_id)
      AND status IN ('pending', 'accepted')
  )
  SELECT DISTINCT
    u.id,
    u.display_name,
    u.email,
    u.role,
    CASE 
      WHEN u.role = 'student' THEN cd_student.name
      WHEN u.role = 'faculty' THEN cd_faculty.name
      ELSE NULL
    END as department_name,
    c.name as college_name,
    u.avatar_path,
    0::BIGINT as mutual_connections_count
  FROM users u
  LEFT JOIN colleges c ON u.college_id = c.id
  LEFT JOIN students s ON u.id = s.user_id
  LEFT JOIN college_departments cd_student ON s.department_id = cd_student.id
  LEFT JOIN faculty f ON u.id = f.user_id
  LEFT JOIN college_departments cd_faculty ON f.department_id = cd_faculty.id
  CROSS JOIN current_user_info cui
  WHERE u.id != current_user_id
    AND u.role IN ('student', 'faculty', 'mentor')
    AND u.id NOT IN (SELECT connected_user_id FROM existing_connections)
    AND (
      u.college_id = cui.college_id
      OR (u.role = 'student' AND s.department_id = cui.student_dept)
      OR (u.role = 'faculty' AND f.department_id = cui.faculty_dept)
    )
  ORDER BY u.display_name
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
