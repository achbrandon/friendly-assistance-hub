-- Add unique constraint to prevent duplicate account types per user
ALTER TABLE public.accounts 
ADD CONSTRAINT unique_user_account_type UNIQUE (user_id, account_type);