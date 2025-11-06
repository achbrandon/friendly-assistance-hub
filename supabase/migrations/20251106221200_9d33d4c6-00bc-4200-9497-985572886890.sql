-- Add INSERT policy for users to create their own transfers
CREATE POLICY "Users can create own transfers"
ON public.transfers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);