import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  email: string;
  otp: string;
  action:
    | "login"
    | "transfer"
    | "withdrawal"
    | "link_account"
    | "domestic_transfer"
    | "international_transfer"
    | "crypto_withdrawal";
  accountType?: string;
  accountIdentifier?: string;
  amount?: string;
  currency?: string;
}

const getEmailContent = (payload: OTPEmailRequest) => {
  const { action, amount, currency, accountType, accountIdentifier } = payload;

  switch (action) {
    case "login":
      return {
        subject: "VaultBank Login Verification Code",
        title: "🔐 Login Verification",
        description: "You are attempting to log in to your VaultBank account.",
        instruction:
          "If you initiated this login request, please use the verification code below to complete your login:",
        expiry:
          "This code will expire in <strong>10 minutes</strong>. Enter this code to access your account.",
        warning:
          "If you did not attempt to log in, please ignore this email and consider changing your password immediately.",
      };

    case "transfer":
      return {
        subject: "VaultBank Transfer Verification Code",
        title: "💸 Transfer Verification",
        description: `You are initiating a transfer${amount ? ` of $${amount}` : ""} from your VaultBank account.`,
        instruction: "To complete this transfer, please use the verification code below:",
        expiry:
          "This code will expire in <strong>10 minutes</strong>. Enter this code to authorize the transfer.",
        warning:
          "If you did not initiate this transfer, please contact our support team immediately.",
      };

    case "crypto_withdrawal":
      return {
        subject: "VaultBank Crypto Withdrawal Verification",
        title: "🪙 Crypto Withdrawal Verification",
        description: `You are withdrawing${currency ? ` ${currency}` : " cryptocurrency"}${amount ? ` ($${amount})` : ""} from your VaultBank account.`,
        instruction:
          "To complete this crypto withdrawal, please use the verification code below:",
        expiry:
          "This code will expire in <strong>10 minutes</strong>. Enter this code to authorize the withdrawal.",
        warning:
          "Crypto transactions are irreversible. If you did not initiate this withdrawal, please contact support immediately.",
      };

    case "domestic_transfer":
      return {
        subject: "VaultBank Domestic Wire Verification",
        title: "🏦 Domestic Wire Transfer Verification",
        description: `You are initiating a domestic wire transfer${amount ? ` of $${amount}` : ""}.`,
        instruction:
          "To complete this wire transfer, please use the verification code below:",
        expiry:
          "This code will expire in <strong>10 minutes</strong>. Enter this code to authorize the transfer.",
        warning:
          "If you did not initiate this wire transfer, please contact our support team immediately.",
      };

    case "international_transfer":
      return {
        subject: "VaultBank International Wire Verification",
        title: "🌍 International Wire Transfer Verification",
        description: `You are initiating an international wire transfer${amount ? ` of $${amount}` : ""}.`,
        instruction:
          "To complete this international transfer, please use the verification code below:",
        expiry:
          "This code will expire in <strong>10 minutes</strong>. Enter this code to authorize the transfer.",
        warning:
          "International transfers may incur additional fees. If you did not initiate this transfer, please contact support immediately.",
      };

    case "withdrawal":
      return {
        subject: "VaultBank Withdrawal Verification",
        title: "💰 Withdrawal Verification",
        description: `You are withdrawing${amount ? ` $${amount}` : " funds"} from your VaultBank account.`,
        instruction:
          "To complete this withdrawal, please use the verification code below:",
        expiry:
          "This code will expire in <strong>10 minutes</strong>. Enter this code to authorize the withdrawal.",
        warning:
          "If you did not initiate this withdrawal, please contact our support team immediately.",
      };

    case "link_account":
    default:
      return {
        subject: "VaultBank Account Link Verification",
        title: "🔗 External Payment Account Link Request",
        description: `${accountType ? `Your account is being linked to <strong>${accountType.charAt(0).toUpperCase() + accountType.slice(1)}</strong>` : "A payment account is being linked to your VaultBank account"} ${accountIdentifier ? `(${accountIdentifier})` : ""}.`,
        instruction:
          "If you initiated this request, please use the verification code below to complete the linking process:",
        expiry:
          "This code will expire in <strong>10 minutes</strong>. Enter this code to complete the account linking.",
        warning:
          "If you did not initiate this account linking, please contact our support team immediately.",
      };
  }
};

const buildEmailHtml = (emailContent: ReturnType<typeof getEmailContent>, otp: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>VaultBank OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0e14;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="width: 600px; max-width: 100%; background-color: #151c28; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.4); border: 1px solid #1e293b;">
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #1e293b;">
                    <h1 style="margin: 0; color: #f8fafc; font-size: 24px; font-weight: 700;">VaultBank</h1>
                    <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Security Verification</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 20px; font-weight: 600;">${emailContent.title}</h2>
                    <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px; line-height: 24px;">${emailContent.description}</p>
                    <p style="margin: 0 0 28px 0; color: #cbd5e1; font-size: 16px; line-height: 24px;">${emailContent.instruction}</p>

                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 28px 0;">
                      <tr>
                        <td style="background-color: #0d1117; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; text-align: center;">
                          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #f8fafc; font-family: 'Courier New', monospace;">${otp}</div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 13px; line-height: 20px;">${emailContent.expiry}</p>

                    <div style="margin: 20px 0 0 0; padding: 16px; background-color: #1e293b; border-left: 4px solid #f59e0b; border-radius: 10px;">
                      <p style="margin: 0; color: #fde68a; font-size: 13px; line-height: 20px;"><strong>Security tip:</strong> Never share this code with anyone. VaultBank staff will never ask for your verification code.</p>
                    </div>

                    <div style="margin: 16px 0 0 0; padding: 16px; background-color: #1e293b; border-left: 4px solid #ef4444; border-radius: 10px;">
                      <p style="margin: 0; color: #fecaca; font-size: 13px; line-height: 20px;">${emailContent.warning}</p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b; background-color: #0d1117; border-radius: 0 0 16px 16px;">
                    <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 18px;">This is an automated message from VaultBank. Please do not reply to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const payload: OTPEmailRequest = await req.json();

    // If no email provider key is configured, don't hard-fail the app.
    // This prevents a 500 loop during demos (users can still use the universal OTP bypass codes).
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not configured; skipping email send.");
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: "Email service not configured",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailContent = getEmailContent(payload);
    const html = buildEmailHtml(emailContent, payload.otp);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VaultBank Security <onboarding@resend.dev>",
        to: [payload.email],
        subject: emailContent.subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      // Don't hard-fail the app (OTP bypass codes may still be used in demos)
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: `Email service error: ${resendResponse.status}`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const result = await resendResponse.json();
    console.log("OTP email sent successfully:", result.id);

    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    // Don't hard-fail the app (OTP bypass codes may still be used)
    return new Response(
      JSON.stringify({ success: false, skipped: true, reason: error.message }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
