-- Create manual deposits table for admin top-ups
CREATE TABLE public.manual_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  deposit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed'
);

ALTER TABLE public.manual_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage manual deposits"
ON public.manual_deposits
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create live user sessions table for monitoring
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  is_online BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Add realtime for user_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;

-- Create admin settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings"
ON public.admin_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "All users can view settings"
ON public.admin_settings
FOR SELECT
USING (true);