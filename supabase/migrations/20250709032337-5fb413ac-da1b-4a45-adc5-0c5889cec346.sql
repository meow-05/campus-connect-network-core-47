-- Fix RLS policies for events to properly handle Platform Admin access and department targeting

-- First, drop existing problematic policies  
DROP POLICY IF EXISTS "Public events for students and mentors" ON public.events;
DROP POLICY IF EXISTS "Department targeted events for students" ON public.events; 
DROP POLICY IF EXISTS "Global events (null target_departments)" ON public.events;
DROP POLICY IF EXISTS "Faculty and admin view all college events" ON public.events;

-- Create comprehensive RLS policies for events
-- 1. Platform Admin can see ALL events across the platform
CREATE POLICY "Platform admin view all events" 
ON public.events 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);

-- 2. Faculty can see all events in their college
CREATE POLICY "Faculty view college events" 
ON public.events 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty' AND
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

-- 3. Students and mentors can see events based on targeting rules
CREATE POLICY "Students and mentors view targeted events" 
ON public.events 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('student', 'mentor') AND
  college_id = (SELECT college_id FROM users WHERE id = auth.uid()) AND
  (
    -- Global events (no department targeting)
    target_departments IS NULL
    OR
    -- Events targeted to their department
    EXISTS (
      SELECT 1 FROM students s 
      JOIN college_departments cd ON s.department_id = cd.id
      WHERE s.user_id = auth.uid() 
      AND cd.name = ANY(target_departments)
    )
    OR
    -- Events created by platform admin (global events)
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = organizer_id AND u.role = 'platform_admin'
    )
  )
);

-- 4. Platform Admin can create events for any college
CREATE POLICY "Platform admin manage all events" 
ON public.events 
FOR ALL 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);

-- 5. Faculty can create events for their college  
CREATE POLICY "Faculty manage college events" 
ON public.events 
FOR ALL 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty' AND
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

-- Fix event_feedback table to allow comment-only submissions
-- The rating column should be nullable to allow comments without ratings
ALTER TABLE public.event_feedback ALTER COLUMN rating DROP NOT NULL;

-- Add constraints to ensure at least comment or rating is provided
ALTER TABLE public.event_feedback 
ADD CONSTRAINT check_feedback_content 
CHECK (comment IS NOT NULL OR rating IS NOT NULL);

-- Ensure proper defaults
ALTER TABLE public.events ALTER COLUMN is_public SET DEFAULT true;

-- Add target_years field if not exists (for future use)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'target_years') THEN
    ALTER TABLE public.events ADD COLUMN target_years integer[];
  END IF;
END $$;