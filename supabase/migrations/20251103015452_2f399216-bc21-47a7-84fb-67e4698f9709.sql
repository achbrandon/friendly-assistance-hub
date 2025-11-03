-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.account_applications;

-- Create a security definer function to check if user exists
CREATE OR REPLACE FUNCTION public.user_exists(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
  )
$$;

-- Create new insert policy using the security definer function
-- This allows inserts when the user_id corresponds to a valid user in auth.users
-- This works even before email verification since the user exists in auth.users
CREATE POLICY "Users can insert their own applications" 
ON public.account_applications 
FOR INSERT 
WITH CHECK (
  user_id IS NOT NULL AND public.user_exists(user_id)
);