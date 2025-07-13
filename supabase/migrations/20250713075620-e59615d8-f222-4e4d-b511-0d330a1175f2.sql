
-- Fix the ambiguous user_id reference in get_user_profile function
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
  WHERE u.id = get_user_profile.user_id  -- Fix: Use function parameter explicitly
    AND u.role IN ('student', 'faculty', 'mentor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_suggested_connections to fix mentor suggestions and exclude platform admins
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
    SELECT u.college_id, u.role as current_role, s.department_id as student_dept, f.department_id as faculty_dept
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
    COALESCE(mutual_count.count, 0) as mutual_connections_count
  FROM users u
  LEFT JOIN colleges c ON u.college_id = c.id
  LEFT JOIN students s ON u.id = s.user_id
  LEFT JOIN college_departments cd_student ON s.department_id = cd_student.id
  LEFT JOIN faculty f ON u.id = f.user_id
  LEFT JOIN college_departments cd_faculty ON f.department_id = cd_faculty.id
  CROSS JOIN current_user_info cui
  LEFT JOIN (
    -- Calculate mutual connections
    SELECT 
      target_user.id as user_id,
      COUNT(*) as count
    FROM users target_user
    JOIN user_connections uc1 ON (uc1.requester_id = target_user.id OR uc1.receiver_id = target_user.id)
    JOIN user_connections uc2 ON (uc2.requester_id = current_user_id OR uc2.receiver_id = current_user_id)
    WHERE uc1.status = 'accepted' 
      AND uc2.status = 'accepted'
      AND (
        (uc1.requester_id = uc2.requester_id AND uc1.requester_id != current_user_id AND uc1.requester_id != target_user.id)
        OR (uc1.requester_id = uc2.receiver_id AND uc1.requester_id != current_user_id AND uc1.requester_id != target_user.id)
        OR (uc1.receiver_id = uc2.requester_id AND uc1.receiver_id != current_user_id AND uc1.receiver_id != target_user.id)
        OR (uc1.receiver_id = uc2.receiver_id AND uc1.receiver_id != current_user_id AND uc1.receiver_id != target_user.id)
      )
    GROUP BY target_user.id
  ) mutual_count ON mutual_count.user_id = u.id
  WHERE u.id != current_user_id
    AND u.role IN ('student', 'faculty', 'mentor')  -- Exclude platform_admin
    AND u.id NOT IN (SELECT connected_user_id FROM existing_connections)
    AND (
      -- For mentors: show all users from any college/department
      cui.current_role = 'mentor'
      -- For students and faculty: show users from same college or department
      OR u.college_id = cui.college_id
      OR (u.role = 'student' AND s.department_id = cui.student_dept)
      OR (u.role = 'faculty' AND f.department_id = cui.faculty_dept)
    )
  ORDER BY u.display_name
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
