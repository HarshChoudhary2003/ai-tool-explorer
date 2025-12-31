-- Create tool submissions table
CREATE TABLE public.tool_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    pricing TEXT NOT NULL,
    submitter_email TEXT NOT NULL,
    submitter_name TEXT,
    additional_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a tool
CREATE POLICY "Anyone can submit tools"
ON public.tool_submissions
FOR INSERT
WITH CHECK (true);

-- Admins can view and manage submissions
CREATE POLICY "Admins can view submissions"
ON public.tool_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
ON public.tool_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
ON public.tool_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add category column to blog_posts for categorization
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add is_featured column to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;