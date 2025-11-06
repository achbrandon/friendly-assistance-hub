import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sendVerificationEmail = async (email: string, fullName: string) => {
  const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
  
  if (!sendgridApiKey) {
    console.log("SENDGRID_API_KEY not configured - skipping email notification");
    return;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 20px; color: #333;">
        <p>Hello ${fullName},</p>
        <p>Great news! Your VaultBank email has been successfully verified.</p>
        <p>You can now sign in to your account and access all features.</p>
        <p>If you didn't request this verification, please contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>VaultBank Team</p>
      </body>
    </html>
  `;

  const plainText = emailHtml
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  try {
    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          subject: "Your VaultBank Email is Verified"
        }],
        from: {
          email: "noreply@vaulteonline.com",
          name: "VaultBank"
        },
        reply_to: {
          email: "support@vaultbankonline.com",
          name: "VaultBank Support Team"
        },
        content: [
          {
            type: "text/plain",
            value: plainText
          },
          {
            type: "text/html",
            value: emailHtml
          }
        ]
      })
    });

    if (emailResponse.ok) {
      console.log("✅ Verification notification email sent to:", email);
    } else {
      console.error("Failed to send verification email:", await emailResponse.text());
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the user by email
    const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (fetchError) {
      throw fetchError;
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Update user to confirm email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (error) {
      throw error;
    }

    // Get user's full name from profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Send verification confirmation email
    await sendVerificationEmail(email, profile?.full_name || 'User');

    console.log("✅ Email confirmed for:", email);

    return new Response(
      JSON.stringify({ success: true, message: 'Email confirmed successfully' }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error confirming email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
