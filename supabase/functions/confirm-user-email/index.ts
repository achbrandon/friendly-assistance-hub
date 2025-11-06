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

  const plainText = `Hello ${fullName},

Your VaultBank email address has been verified successfully.

You can now access your account at https://vaultbankonline.com

If you did not request this, please contact support@vaultbankonline.com immediately.

Thank you,
VaultBank Team

---
VaultBank Financial
806 E Exchange St, Brodhead, WI 53520
This is an automated message. Please do not reply to this email.`;

  const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 30px; text-align: center; background-color: #2563eb; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: normal;">Email Verified</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">Hello ${fullName},</p>
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">Your VaultBank email address has been verified successfully.</p>
                <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #333333;">You can now access your account.</p>
                <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #666666;">If you did not request this, please contact our support team immediately.</p>
                <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 24px; color: #333333;">Thank you,<br>VaultBank Team</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 18px; color: #666666;">VaultBank Financial</p>
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #666666;">806 E Exchange St, Brodhead, WI 53520</p>
                <p style="margin: 10px 0 0 0; font-size: 11px; line-height: 16px; color: #999999;">This is an automated message. Please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

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
