-- Add new columns to notices table for enhanced functionality
ALTER TABLE public.notices 
ADD COLUMN link TEXT,
ADD COLUMN attachment_url TEXT;

-- Create storage bucket for notice attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notice-attachments', 'notice-attachments', true);

-- Storage policies for notice attachments bucket
CREATE POLICY "Faculty can upload notice attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'notice-attachments' AND 
  (SELECT role FROM users WHERE id = auth.uid()) IN ('faculty', 'platform_admin')
);

CREATE POLICY "Anyone can view notice attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'notice-attachments');

CREATE POLICY "Faculty can update their notice attachments" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'notice-attachments' AND 
  (SELECT role FROM users WHERE id = auth.uid()) IN ('faculty', 'platform_admin')
);

CREATE POLICY "Faculty can delete their notice attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'notice-attachments' AND 
  (SELECT role FROM users WHERE id = auth.uid()) IN ('faculty', 'platform_admin')
);

-- Update RLS policies for notices table to support proper access control
DROP POLICY IF EXISTS "Faculty post notices" ON public.notices;
DROP POLICY IF EXISTS "faculty_notice_management" ON public.notices;
DROP POLICY IF EXISTS "student_notice_view" ON public.notices;

-- Platform admin can manage all notices
CREATE POLICY "Platform admin manages all notices" 
ON public.notices 
FOR ALL 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);

-- Faculty can create notices for their college
CREATE POLICY "Faculty create notices for their college" 
ON public.notices 
FOR INSERT 
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty' AND 
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

-- Faculty can view notices for their college
CREATE POLICY "Faculty view college notices" 
ON public.notices 
FOR SELECT 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty' AND 
  college_id = (SELECT college_id FROM users WHERE id = auth.uid())
);

-- Faculty can edit/delete their own notices
CREATE POLICY "Faculty manage own notices" 
ON public.notices 
FOR UPDATE 
USING (
  posted_by = auth.uid() AND 
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty'
);

CREATE POLICY "Faculty delete own notices" 
ON public.notices 
FOR DELETE 
USING (
  posted_by = auth.uid() AND 
  (SELECT role FROM users WHERE id = auth.uid()) = 'faculty'
);

-- Update notice_categories RLS policies
CREATE POLICY "Faculty view college categories" 
ON public.notice_categories 
FOR SELECT 
USING (
  college_id = (SELECT college_id FROM users WHERE id = auth.uid()) OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);

CREATE POLICY "Faculty manage college categories" 
ON public.notice_categories 
FOR ALL 
USING (
  college_id = (SELECT college_id FROM users WHERE id = auth.uid()) OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'platform_admin'
);