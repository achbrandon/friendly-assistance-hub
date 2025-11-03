-- Add columns to transactions table for crypto operations
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT,
ADD COLUMN IF NOT EXISTS destination_wallet_address TEXT,
ADD COLUMN IF NOT EXISTS crypto_currency TEXT;