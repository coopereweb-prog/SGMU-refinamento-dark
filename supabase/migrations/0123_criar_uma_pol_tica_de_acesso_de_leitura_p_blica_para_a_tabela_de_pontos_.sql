CREATE POLICY "Allow public read access to points"
ON public.points
FOR SELECT
USING (true);