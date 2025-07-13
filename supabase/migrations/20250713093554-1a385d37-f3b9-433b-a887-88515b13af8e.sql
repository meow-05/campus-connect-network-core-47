
-- Table to store reports by users
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID NOT NULL REFERENCES users(id),
  reported_by UUID NOT NULL REFERENCES users(id),
  role_of_reported_by user_role NOT NULL, -- 'student', 'faculty', etc.
  reason TEXT NOT NULL, -- predefined dropdown options
  message TEXT, -- optional message
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false
);

-- Table to log user deactivations/reactivations
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL, -- 'deactivated', 'reactivated'
  performed_by UUID REFERENCES users(id),
  role_of_actor user_role,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Add is_active column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enable RLS on new tables
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_reports
CREATE POLICY "Users can view their own reports" ON user_reports
  FOR SELECT USING (reported_by = auth.uid());

CREATE POLICY "Faculty can create reports" ON user_reports
  FOR INSERT WITH CHECK (
    reported_by = auth.uid() AND 
    role_of_reported_by IN ('faculty', 'platform_admin')
  );

CREATE POLICY "Platform admin can view all reports" ON user_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'platform_admin'
    )
  );

-- RLS Policies for user_activity_log
CREATE POLICY "Platform admin access only" ON user_activity_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'platform_admin'
    )
  );

-- Add students view policy for different roles
CREATE POLICY "Students can be viewed by faculty and mentors" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role IN ('faculty', 'mentor', 'platform_admin')
      AND (
        u.role = 'platform_admin' OR
        u.college_id = (SELECT college_id FROM users WHERE id = students.user_id)
      )
    )
  );
