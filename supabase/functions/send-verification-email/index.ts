import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import QRCode from "https://esm.sh/qrcode@1.5.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  email: string;
  fullName: string;
  verificationToken: string;
  qrSecret: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - email functionality disabled");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email service not configured. Please add RESEND_API_KEY to continue." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    const { email, fullName, verificationToken, qrSecret }: VerificationRequest = await req.json();

    // Generate QR code as base64
    const qrCodeDataUrl = await QRCode.toDataURL(qrSecret, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const verificationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${verificationToken}&type=signup`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your VaultBank Account</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">VaultBank</h1>
                      <p style="margin: 10px 0 0; color: #e0e0e0; font-size: 14px;">Secure Banking Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome to VaultBank, ${fullName}!</h2>
                      
                      <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                        Thank you for creating an account with VaultBank. We're reviewing your application and verifying your details.
                      </p>
                      
                      <div style="background-color: #f8f9fa; border-left: 4px solid #1a1a1a; padding: 20px; margin: 30px 0;">
                        <p style="margin: 0; color: #1a1a1a; font-size: 14px; line-height: 1.6;">
                          <strong>⏰ Verification Timeline:</strong><br>
                          Your account will be reviewed within <strong>2-3 business days</strong>. You'll receive a confirmation email once approved.
                        </p>
                      </div>

                      <h3 style="margin: 30px 0 20px; color: #1a1a1a; font-size: 20px; font-weight: 600;">🔐 Two-Factor Authentication</h3>
                      
                      <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                        For your security, we require two-factor authentication. Please scan this QR code with your authenticator app or save it securely:
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0; padding: 30px; background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px;">
                        <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 300px; width: 100%; height: auto;" />
                        <p style="margin: 20px 0 0; color: #666666; font-size: 14px;">
                          <strong>Secret Key:</strong><br>
                          <code style="background-color: #f4f4f4; padding: 8px 12px; border-radius: 4px; font-size: 12px; display: inline-block; margin-top: 8px;">${qrSecret}</code>
                        </p>
                      </div>

                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Important Security Notice:</strong><br>
                          You must verify your email and complete QR authentication before you can perform any transactions. This protects your account from unauthorized access.
                        </p>
                      </div>

                      <h3 style="margin: 30px 0 15px; color: #1a1a1a; font-size: 18px; font-weight: 600;">Next Steps:</h3>
                      <ol style="margin: 0; padding-left: 20px; color: #4a4a4a; font-size: 15px; line-height: 1.8;">
                        <li>Click the verification button below to confirm your email</li>
                        <li>Save your QR code in a secure authenticator app</li>
                        <li>Wait for account approval (2-3 business days)</li>
                        <li>Complete QR verification on first login</li>
                      </ol>

                      <div style="text-align: center; margin: 40px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                          Verify Email Address
                        </a>
                      </div>

                      <p style="margin: 30px 0 0; color: #999999; font-size: 13px; line-height: 1.6;">
                        If you didn't create this account, please ignore this email or contact our support team immediately.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px; color: #666666; font-size: 14px; text-align: center;">
                        <strong>VaultBank</strong> - Secure. Reliable. Trusted.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px; text-align: center; line-height: 1.6;">
                        This is an automated security email. Please do not reply to this message.
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
      from: "VaultBank Security <noreply@vaultbankonline.com>",
      to: [email],
      subject: "🔐 Verify Your VaultBank Account - Action Required",
      html: emailHtml,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
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
