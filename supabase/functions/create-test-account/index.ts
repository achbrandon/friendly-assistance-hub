import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate bank address
function generateBankAddress(accountNumber: string): string {
  // VaultBank Brodhead branch address
  return "806 E Exchange St, Brodhead, WI 53520-0108, US";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create test user with known credentials
    const testEmail = `test${Date.now()}@vaultbank.com`;
    const testPassword = "Test123456!";
    const testPin = "1234";
    
    console.log('Creating test user...');
    
    // Create user with admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: "Test User"
      }
    });

    if (userError) throw userError;
    
    console.log('User created:', userData.user.id);

    // Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update profile with test data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        qr_verified: true,
        can_transact: true,
        pin: testPin,
        full_name: "Test User"
      })
      .eq('id', userData.user.id);

    if (profileError) throw profileError;
    
    console.log('Profile created');

    // Generate unique 12-digit account numbers
    const checkingAccountNumber = '1000' + Math.floor(10000000 + Math.random() * 90000000).toString();
    const savingsAccountNumber = '2000' + Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // Generate unique routing number (Chase-style)
    const routingNumber = '021000021';

    // Create checking account with money
    const { data: checkingAccount, error: checkingError } = await supabase
      .from('accounts')
      .insert({
        user_id: userData.user.id,
        account_type: 'checking',
        account_name: 'Checking Account',
        account_number: checkingAccountNumber,
        routing_number: routingNumber,
        balance: 50000.00,
        available_balance: 50000.00,
        status: 'active'
      })
      .select()
      .single();

    if (checkingError) throw checkingError;
    console.log('Checking account created');

    // Create savings account with money
    const { data: savingsAccount, error: savingsError } = await supabase
      .from('accounts')
      .insert({
        user_id: userData.user.id,
        account_type: 'savings',
        account_name: 'Savings Account',
        account_number: savingsAccountNumber,
        routing_number: routingNumber,
        balance: 100000.00,
        available_balance: 100000.00,
        status: 'active'
      })
      .select()
      .single();

    if (savingsError) throw savingsError;
    console.log('Savings account created');

    // Generate account details for checking account
    const checkingBranchCode = routingNumber.slice(1, 5);
    const checkingBankAddress = generateBankAddress(checkingAccountNumber);
    
    const { error: checkingDetailsError } = await supabase
      .from('account_details')
      .insert({
        account_id: checkingAccount.id,
        user_id: userData.user.id,
        iban: '',
        swift_code: 'VBKNUS33XXX',
        branch_code: checkingBranchCode,
        bank_address: checkingBankAddress
      });

    if (checkingDetailsError) throw checkingDetailsError;
    console.log('Checking account details created');

    // Generate account details for savings account
    const savingsBranchCode = routingNumber.slice(1, 5);
    const savingsBankAddress = generateBankAddress(savingsAccountNumber);
    
    const { error: savingsDetailsError } = await supabase
      .from('account_details')
      .insert({
        account_id: savingsAccount.id,
        user_id: userData.user.id,
        iban: '',
        swift_code: 'VBKNUS33XXX',
        branch_code: savingsBranchCode,
        bank_address: savingsBankAddress
      });

    if (savingsDetailsError) throw savingsDetailsError;
    console.log('Savings account details created');

    console.log('Accounts and details created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email: testEmail,
          password: testPassword,
          pin: testPin
        },
        message: "Test account created successfully with $50,000 in checking and $100,000 in savings"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error creating test account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
};

serve(handler);
