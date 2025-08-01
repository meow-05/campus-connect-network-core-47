-- Add bio, github_url, linkedin_url to faculty table for profile information
ALTER TABLE public.faculty 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text;