
-- Fix the event_feedback table structure
ALTER TABLE public.event_feedback 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update RLS policies for better access control
DROP POLICY IF EXISTS "student_event_view" ON public.events;
DROP POLICY IF EXISTS "College members view events" ON public.events;
DROP POLICY IF EXISTS "faculty_event_view" ON public.events;

-- Create new comprehensive RLS policies for events
CREATE POLICY "Public events for students and mentors" 
ON public.events 
FOR SELECT 
USING (
  is_public = true AND (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('student', 'mentor')
  )
);

CREATE POLICY "Department targeted events for students" 
ON public.events 
FOR SELECT 
USING (
  target_departments IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM students s 
    JOIN college_departments cd ON s.department_id = cd.id
    WHERE s.user_id = auth.uid() 
    AND cd.name::text = ANY(
      SELECT unnest(target_departments)::text
    )
  )
);

CREATE POLICY "Global events (null target_departments)" 
ON public.events 
FOR SELECT 
USING (
  target_departments IS NULL AND 
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Faculty and admin view all college events" 
ON public.events 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('faculty', 'platform_admin') AND
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

-- Add RLS policies for event_feedback
DROP POLICY IF EXISTS "Users manage feedback" ON public.event_feedback;

CREATE POLICY "Users can view feedback for events they can see" 
ON public.event_feedback 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_feedback.event_id 
    AND e.college_id = (SELECT college_id FROM users WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can manage their own feedback" 
ON public.event_feedback 
FOR ALL 
USING (user_id = auth.uid());

-- Ensure proper constraints and defaults
ALTER TABLE public.events 
ALTER COLUMN college_id SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_events_college_target_dept 
ON public.events(college_id, target_departments);

CREATE INDEX IF NOT EXISTS idx_events_public 
ON public.events(college_id, is_public) 
WHERE is_public = true;
