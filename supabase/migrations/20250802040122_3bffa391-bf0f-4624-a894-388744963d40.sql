-- Enable RLS on project_reactions and project_comments tables
ALTER TABLE public.project_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_reactions
-- Users can view all reactions
CREATE POLICY "Anyone can view project reactions" 
ON public.project_reactions 
FOR SELECT 
USING (true);

-- Users can add their own reactions
CREATE POLICY "Users can add their own reactions" 
ON public.project_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions" 
ON public.project_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for project_comments
-- Users can view all comments
CREATE POLICY "Anyone can view project comments" 
ON public.project_comments 
FOR SELECT 
USING (true);

-- Users can add their own comments
CREATE POLICY "Users can add their own comments" 
ON public.project_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can edit their own comments
CREATE POLICY "Users can edit their own comments" 
ON public.project_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own comments OR project leads can delete any comment
CREATE POLICY "Users and project leads can delete comments" 
ON public.project_comments 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() = (
    SELECT team_lead 
    FROM projects 
    WHERE projects.id = project_comments.project_id
  )
);