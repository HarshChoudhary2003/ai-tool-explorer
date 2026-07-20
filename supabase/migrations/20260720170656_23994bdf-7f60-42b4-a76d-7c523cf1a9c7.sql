
-- Replace overly permissive tool_ratings SELECT policy
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.tool_ratings;
CREATE POLICY "Authenticated users can view ratings"
  ON public.tool_ratings
  FOR SELECT
  TO authenticated
  USING (true);

-- Replace anonymous tool_submissions INSERT policy with authenticated-only
DROP POLICY IF EXISTS "Anyone can submit tools" ON public.tool_submissions;
CREATE POLICY "Authenticated users can submit tools"
  ON public.tool_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
