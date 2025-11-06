-- Auto-confirm all existing user emails
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmation_token = '', 
    confirmation_sent_at = NULL
WHERE email_confirmed_at IS NULL;