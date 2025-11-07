-- Enable realtime for support_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- Also enable realtime for support_tickets for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;