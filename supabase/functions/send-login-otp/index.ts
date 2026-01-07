import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginOTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    // Skip sending if no API key - bypass codes still work
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email send");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(resendApiKey);
    const { email, otp }: LoginOTPRequest = await req.json();

    console.log(`Sending login OTP to ${email}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VaultBank Login Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                      <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">🔐 VaultBank</h1>
                      <p style="margin: 8px 0 0 0; color: #666666; font-size: 14px;">Login Security Verification</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">Login Verification Code</h2>
                      <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 24px;">
                        Someone is trying to sign in to your VaultBank account. Please use the verification code below to complete your login:
                      </p>
                      
                      <!-- OTP Code Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                        <tr>
                          <td style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 24px; text-align: center;">
                            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'Courier New', monospace;">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 20px;">
                        This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email and secure your account immediately by changing your password.
                      </p>
                      
                      <div style="margin: 24px 0 0 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 13px; line-height: 18px;">
                          <strong>⚠️ Security Warning:</strong> Never share this code with anyone, including VaultBank staff. We will never ask for your verification code via phone, email, or text message.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #e5e5e5; background-color: #f8f9fa;">
                      <p style="margin: 0 0 8px 0; color: #999999; font-size: 12px; line-height: 18px;">
                        This is an automated security message from VaultBank. Please do not reply to this email.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px; line-height: 18px;">
                        © 2025 VaultBank. All rights reserved. | Secure Banking Services
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "VaultBank Security <onboarding@resend.dev>",
      to: [email],
      subject: "🔐 Your VaultBank Login Verification Code",
      html: htmlContent,
    });

    console.log("Login OTP email sent successfully via Resend:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending login OTP email:", error);
    // Return success anyway since bypass codes still work
    return new Response(
      JSON.stringify({ success: true, skipped: true, reason: error.message }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
