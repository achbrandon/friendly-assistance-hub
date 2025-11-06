-- Drop and recreate policies for existing tables

-- Alerts
DROP POLICY IF EXISTS "Users manage own alerts" ON public.alerts;
CREATE POLICY "Users manage own alerts" ON public.alerts
  FOR ALL USING (auth.uid() = user_id);

-- Bill Payments  
DROP POLICY IF EXISTS "Users manage own bill payments" ON public.bill_payments;
CREATE POLICY "Users manage own bill payments" ON public.bill_payments
  FOR ALL USING (auth.uid() = user_id);

-- Cards
DROP POLICY IF EXISTS "Users manage own cards" ON public.cards;
CREATE POLICY "Users manage own cards" ON public.cards
  FOR ALL USING (auth.uid() = user_id);

-- Credit Scores
DROP POLICY IF EXISTS "Users view own credit scores" ON public.credit_scores;
CREATE POLICY "Users view own credit scores" ON public.credit_scores
  FOR SELECT USING (auth.uid() = user_id);

-- Crypto Wallets
DROP POLICY IF EXISTS "Users manage own crypto wallets" ON public.crypto_wallets;
CREATE POLICY "Users manage own crypto wallets" ON public.crypto_wallets
  FOR ALL USING (auth.uid() = user_id);

-- Loans
DROP POLICY IF EXISTS "Users view own loans" ON public.loans;
CREATE POLICY "Users view own loans" ON public.loans
  FOR SELECT USING (auth.uid() = user_id);

-- Mobile Deposits
DROP POLICY IF EXISTS "Users manage own mobile deposits" ON public.mobile_deposits;
CREATE POLICY "Users manage own mobile deposits" ON public.mobile_deposits
  FOR ALL USING (auth.uid() = user_id);

-- Offers
DROP POLICY IF EXISTS "Users manage own offers" ON public.offers;
CREATE POLICY "Users manage own offers" ON public.offers
  FOR ALL USING (auth.uid() = user_id);

-- Account Requests
DROP POLICY IF EXISTS "Users manage own account requests" ON public.account_requests;
CREATE POLICY "Users manage own account requests" ON public.account_requests
  FOR ALL USING (auth.uid() = user_id);

-- Statements
DROP POLICY IF EXISTS "Users view own statements" ON public.statements;
CREATE POLICY "Users view own statements" ON public.statements
  FOR SELECT USING (auth.uid() = user_id);