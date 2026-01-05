import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AMLNotificationRequest {
  email: string;
  userName: string;
  notificationType: 'status_update' | 'verification_complete' | 'transfers_unlocked' | 'action_required' | 'deadline_reminder';
  caseId?: string;
  statusField?: string;
  newStatus?: string;
  deadlineDate?: string;
  transferAmount?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured. Please add RESEND_API_KEY.");
    }

    const { 
      email, 
      userName, 
      notificationType, 
      caseId,
      statusField,
      newStatus,
      deadlineDate,
      transferAmount
    }: AMLNotificationRequest = await req.json();

    console.log(`Sending AML notification to ${email} - Type: ${notificationType}`);

    const getEmailContent = () => {
      switch (notificationType) {
        case 'status_update':
          return {
            subject: 'VaultBank AML Compliance Status Update',
            title: '📋 Compliance Status Updated',
            headline: 'Your verification status has been updated',
            description: `Your ${statusField?.replace(/_/g, ' ') || 'compliance'} verification has been updated to: <strong style="color: #22c55e;">${newStatus || 'Updated'}</strong>`,
            ctaText: 'View Compliance Dashboard',
            ctaUrl: 'https://vaulteonline.com/bank/dashboard/compliance',
            additionalInfo: 'Continue to monitor your compliance dashboard for further updates on your verification progress.'
          };
        
        case 'verification_complete':
          return {
            subject: '✅ VaultBank AML Verification Complete',
            title: '🎉 Verification Complete!',
            headline: 'All compliance requirements have been satisfied',
            description: 'Congratulations! Your AML compliance verification has been successfully completed. All required documentation and verification steps have been approved.',
            ctaText: 'Access Your Account',
            ctaUrl: 'https://vaulteonline.com/bank/dashboard',
            additionalInfo: 'Your account now has full access to all banking features including instant transfers.'
          };
        
        case 'transfers_unlocked':
          return {
            subject: '🚀 VaultBank Transfers Now Available',
            title: '💸 Instant Transfers Unlocked!',
            headline: 'Your transfers are now enabled',
            description: `Great news! With your AML compliance complete, you can now make instant transfers${transferAmount ? ` up to $${transferAmount}` : ''}. Our VaultCore™ system processes transfers within seconds.`,
            ctaText: 'Make a Transfer',
            ctaUrl: 'https://vaulteonline.com/bank/dashboard/transfers',
            additionalInfo: 'Transfers are processed instantly 24/7 with full security encryption.'
          };
        
        case 'action_required':
          return {
            subject: '⚠️ VaultBank: Action Required on Your Compliance',
            title: '⚠️ Action Required',
            headline: 'Please complete your verification',
            description: `Your ${statusField?.replace(/_/g, ' ') || 'compliance verification'} requires attention. Please review and complete the required steps to continue with your account verification.`,
            ctaText: 'Complete Verification',
            ctaUrl: 'https://vaulteonline.com/bank/dashboard/compliance',
            additionalInfo: 'Failure to complete verification may result in delays to your account access.'
          };
        
        case 'deadline_reminder':
          return {
            subject: '⏰ VaultBank: Compliance Deadline Approaching',
            title: '⏰ Deadline Reminder',
            headline: 'Your compliance deadline is approaching',
            description: `Your AML compliance verification deadline is ${deadlineDate || 'approaching soon'}. Please ensure all required documentation and deposits are submitted before the deadline.`,
            ctaText: 'View Requirements',
            ctaUrl: 'https://vaulteonline.com/bank/dashboard/compliance',
            additionalInfo: 'Contact support if you need assistance meeting your compliance requirements.'
          };
        
        default:
          return {
            subject: 'VaultBank Compliance Notification',
            title: '📋 Compliance Update',
            headline: 'Important update regarding your compliance',
            description: 'There has been an update to your AML compliance status. Please review your compliance dashboard for details.',
            ctaText: 'View Dashboard',
            ctaUrl: 'https://vaulteonline.com/bank/dashboard/compliance',
            additionalInfo: 'Contact support if you have any questions.'
          };
      }
    };

    const emailContent = getEmailContent();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailContent.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0e14;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #151c28; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.4); border: 1px solid #1e293b;">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #1e293b;">
                      <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">VaultBank</h1>
                      </div>
                      <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">AML Compliance Center</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 24px; font-weight: 600; text-align: center;">${emailContent.title}</h2>
                      <p style="margin: 0 0 32px 0; color: #94a3b8; font-size: 16px; text-align: center;">${emailContent.headline}</p>
                      
                      <!-- Greeting -->
                      <p style="margin: 0 0 24px 0; color: #cbd5e1; font-size: 16px; line-height: 26px;">
                        Dear ${userName || 'Valued Customer'},
                      </p>
                      
                      <!-- Main Message -->
                      <div style="margin: 0 0 32px 0; padding: 24px; background-color: #1e293b; border-radius: 12px; border-left: 4px solid #3b82f6;">
                        <p style="margin: 0; color: #e2e8f0; font-size: 16px; line-height: 26px;">
                          ${emailContent.description}
                        </p>
                      </div>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${emailContent.ctaUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 10px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                              ${emailContent.ctaText}
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Additional Info -->
                      <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 14px; line-height: 22px; text-align: center;">
                        ${emailContent.additionalInfo}
                      </p>
                      
                      <!-- Compliance Badges -->
                      <div style="margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #1e293b; text-align: center;">
                        <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Protected By</p>
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center">
                              <span style="display: inline-block; margin: 0 8px; padding: 8px 16px; background-color: #1e293b; border-radius: 6px; color: #22c55e; font-size: 12px; font-weight: 600;">✓ FinCEN Registered</span>
                              <span style="display: inline-block; margin: 0 8px; padding: 8px 16px; background-color: #1e293b; border-radius: 6px; color: #3b82f6; font-size: 12px; font-weight: 600;">✓ FDIC Insured</span>
                              <span style="display: inline-block; margin: 0 8px; padding: 8px 16px; background-color: #1e293b; border-radius: 6px; color: #8b5cf6; font-size: 12px; font-weight: 600;">✓ SOC 2 Certified</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Security Notice -->
                  <tr>
                    <td style="padding: 0 40px 24px 40px;">
                      <div style="padding: 16px; background-color: #1e293b; border-radius: 8px; border: 1px solid #334155;">
                        <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 20px; text-align: center;">
                          🔒 This email was sent from a secure VaultBank server. Never share your login credentials or verification codes with anyone.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b; background-color: #0d1117; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                        Case Reference: ${caseId || 'N/A'}
                      </p>
                      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                        Questions? Contact us at <a href="mailto:compliance@vaulteonline.com" style="color: #3b82f6; text-decoration: none;">compliance@vaulteonline.com</a>
                      </p>
                      <p style="margin: 0; color: #475569; font-size: 11px;">
                        © 2025 VaultBank. All rights reserved. | <a href="https://vaulteonline.com/privacy" style="color: #475569; text-decoration: none;">Privacy Policy</a>
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

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VaultBank Compliance <compliance@vaulteonline.com>",
        to: [email],
        subject: emailContent.subject,
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Email service error: ${resendResponse.status}`);
    }

    const result = await resendResponse.json();
    console.log("AML notification email sent successfully:", result.id);

    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending AML notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
