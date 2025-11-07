-- Allow users to close their own support tickets
CREATE POLICY "Users can close own tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to create their own support tickets
CREATE POLICY "Users can create own tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tickets (typing status, etc)
CREATE POLICY "Users can update own ticket status"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own messages
CREATE POLICY "Users can insert own messages"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM support_tickets
  WHERE support_tickets.id = ticket_id
  AND support_tickets.user_id = auth.uid()
));

-- Allow users to mark messages as read
CREATE POLICY "Users can update message read status"
ON public.support_messages
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM support_tickets
  WHERE support_tickets.id = ticket_id
  AND support_tickets.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM support_tickets
  WHERE support_tickets.id = ticket_id
  AND support_tickets.user_id = auth.uid()
));