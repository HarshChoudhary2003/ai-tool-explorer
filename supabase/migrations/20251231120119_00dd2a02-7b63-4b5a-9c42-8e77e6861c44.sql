-- =============================================
-- PHASE 1: TRENDING PAGE - Tool Views Table
-- =============================================

-- Create tool_views table to track views persistently
CREATE TABLE public.tool_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES public.ai_tools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_tool_views_tool_id ON public.tool_views(tool_id);
CREATE INDEX idx_tool_views_viewed_at ON public.tool_views(viewed_at);
CREATE INDEX idx_tool_views_tool_viewed ON public.tool_views(tool_id, viewed_at);

-- Enable RLS
ALTER TABLE public.tool_views ENABLE ROW LEVEL SECURITY;

-- Anyone can view tool view counts (aggregated)
CREATE POLICY "Anyone can view tool views"
ON public.tool_views
FOR SELECT
USING (true);

-- Anyone can insert views (for tracking)
CREATE POLICY "Anyone can insert views"
ON public.tool_views
FOR INSERT
WITH CHECK (true);

-- =============================================
-- PHASE 2: REVIEWS SYSTEM - Review Helpful Votes
-- =============================================

-- Add helpful_count to tool_ratings
ALTER TABLE public.tool_ratings 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Create review_helpful_votes table
CREATE TABLE public.review_helpful_votes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.tool_ratings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all helpful votes
CREATE POLICY "Anyone can view helpful votes"
ON public.review_helpful_votes
FOR SELECT
USING (true);

-- Users can vote on reviews
CREATE POLICY "Users can vote on reviews"
ON public.review_helpful_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their vote
CREATE POLICY "Users can remove their vote"
ON public.review_helpful_votes
FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- PHASE 3: EMAIL NOTIFICATIONS
-- =============================================

-- Create user_category_interests table
CREATE TABLE public.user_category_interests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category tool_category NOT NULL,
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.user_category_interests ENABLE ROW LEVEL SECURITY;

-- Users can view their own interests
CREATE POLICY "Users can view their own interests"
ON public.user_category_interests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add their own interests
CREATE POLICY "Users can add their own interests"
ON public.user_category_interests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own interests
CREATE POLICY "Users can update their own interests"
ON public.user_category_interests
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own interests
CREATE POLICY "Users can delete their own interests"
ON public.user_category_interests
FOR DELETE
USING (auth.uid() = user_id);

-- Create tool_notifications_log table
CREATE TABLE public.tool_notifications_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES public.ai_tools(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, tool_id)
);

-- Enable RLS
ALTER TABLE public.tool_notifications_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.tool_notifications_log
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
ON public.tool_notifications_log
FOR INSERT
WITH CHECK (true);

-- =============================================
-- DATABASE FUNCTION: Get Trending Tools
-- =============================================

CREATE OR REPLACE FUNCTION public.get_trending_tools(
    days_back INTEGER DEFAULT 7,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    tool_id UUID,
    tool_name TEXT,
    view_count BIGINT,
    bookmark_count BIGINT,
    rating_count BIGINT,
    trending_score NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id AS tool_id,
        t.name AS tool_name,
        COALESCE(v.view_count, 0) AS view_count,
        COALESCE(b.bookmark_count, 0) AS bookmark_count,
        COALESCE(r.rating_count, 0) AS rating_count,
        (
            COALESCE(v.view_count, 0) * 1 + 
            COALESCE(b.bookmark_count, 0) * 5 + 
            COALESCE(r.rating_count, 0) * 3
        )::NUMERIC AS trending_score
    FROM public.ai_tools t
    LEFT JOIN (
        SELECT tool_id, COUNT(*) AS view_count
        FROM public.tool_views
        WHERE viewed_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY tool_id
    ) v ON t.id = v.tool_id
    LEFT JOIN (
        SELECT tool_id, COUNT(*) AS bookmark_count
        FROM public.bookmarks
        WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY tool_id
    ) b ON t.id = b.tool_id
    LEFT JOIN (
        SELECT tool_id, COUNT(*) AS rating_count
        FROM public.tool_ratings
        WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY tool_id
    ) r ON t.id = r.tool_id
    ORDER BY trending_score DESC
    LIMIT limit_count;
END;
$$;