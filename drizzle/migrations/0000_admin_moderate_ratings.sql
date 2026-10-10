CREATE POLICY "Admins can delete ratings"
ON public.tool_ratings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));