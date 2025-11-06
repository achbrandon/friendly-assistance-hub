import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationDecisionRequest {
  applicantName: string;
  applicantEmail: string;
  applicationType: "account" | "card" | "loan";
  decision: "approved" | "rejected";
  accountType?: string;
  cardType?: string;
  loanAmount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    
    if (!sendgridApiKey) {
      console.log("SENDGRID_API_KEY not configured - email functionality disabled");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email service not configured. Please add SENDGRID_API_KEY to continue." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const {
      applicantName,
      applicantEmail,
      applicationType,
      decision,
      accountType,
      cardType,
      loanAmount,
    }: ApplicationDecisionRequest = await req.json();

    console.log("Processing application decision email:", {
      applicantEmail,
      applicationType,
      decision,
    });

    // Customize email based on application type and decision
    let subject = "";
    let htmlContent = "";

    if (decision === "approved") {
      switch (applicationType) {
        case "account":
          subject = "Your VaultBank Account Application Has Been Approved! 🎉";
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                        <tr>
                          <td style="padding: 48px 48px 32px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700;">
                              🎉 Congratulations!
                            </h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 48px;">
                            <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 700;">
                              Dear ${applicantName},
                            </h2>
                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.7;">
                              We're excited to inform you that your <strong>${accountType} account application</strong> has been approved!
                            </p>
                            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px; padding: 20px; margin: 24px 0;">
                              <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.7;">
                                <strong>✓ Application Status:</strong> Approved<br>
                                <strong>✓ Account Type:</strong> ${accountType}<br>
                                <strong>✓ Setup Time:</strong> 24-48 hours
                              </p>
                            </div>
                            <h3 style="margin: 32px 0 16px; color: #1a1a1a; font-size: 20px; font-weight: 700;">
                              What's Next?
                            </h3>
                            <ul style="margin: 0 0 24px; padding-left: 24px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                              <li>Your account will be fully activated within 24-48 hours</li>
                              <li>You can now sign in to your account at vaultbankonline.com</li>
                              <li>Download our mobile app for easy access on the go</li>
                              <li>Explore our online banking features and services</li>
                            </ul>
                            <p style="margin: 24px 0 0; color: #4a5568; font-size: 15px; line-height: 1.7;">
                              If you have any questions, our support team is here to help.
                            </p>
                            <p style="margin: 32px 0 0; color: #4a5568; font-size: 15px; line-height: 1.7;">
                              Best regards,<br>
                              <strong>The VaultBank Team</strong>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 32px 48px; background-color: #f7fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; color: #718096; font-size: 13px; line-height: 1.6;">
                              © 2025 VaultBank. All rights reserved.<br>
                              This is an automated notification email.
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
          break;
        case "card":
          subject = "Your VaultBank Card Application Has Been Approved! 💳";
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="padding: 48px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 36px;">💳 Great News!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 48px;">
                      <h2 style="color: #1a1a1a; font-size: 24px;">Dear ${applicantName},</h2>
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7;">
                        Your <strong>${cardType} card application</strong> has been approved!
                      </p>
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7;">
                        Your new card will be mailed to your address within 5-7 business days.
                      </p>
                      <h3 style="color: #1a1a1a;">What to Expect:</h3>
                      <ul style="color: #4a5568; font-size: 15px;">
                        <li>Your card will arrive in a secure envelope</li>
                        <li>Activate your card online or by phone</li>
                        <li>Start enjoying your card benefits immediately after activation</li>
                      </ul>
                      <p style="color: #4a5568; margin-top: 32px;">
                        Best regards,<br><strong>The VaultBank Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `;
          break;
        case "loan":
          subject = "Your VaultBank Loan Application Has Been Approved! ✅";
          htmlContent = `
            <!DOCTYPE html>
            <html>
              <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="padding: 48px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 36px;">✅ Approved!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 48px;">
                      <h2 style="color: #1a1a1a; font-size: 24px;">Dear ${applicantName},</h2>
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7;">
                        We're pleased to inform you that your loan application for <strong>$${loanAmount?.toLocaleString()}</strong> has been approved!
                      </p>
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.7;">
                        Our loan specialist will contact you within 1-2 business days to finalize the details.
                      </p>
                      <h3 style="color: #1a1a1a;">Next Steps:</h3>
                      <ul style="color: #4a5568; font-size: 15px;">
                        <li>Review your loan terms and conditions</li>
                        <li>Complete any required documentation</li>
                        <li>Set up your payment schedule</li>
                      </ul>
                      <p style="color: #4a5568; margin-top: 32px;">
                        Best regards,<br><strong>The VaultBank Team</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `;
          break;
      }
    } else {
      // Rejected
      subject = `Update on Your VaultBank ${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} Application`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
              <tr>
                <td style="padding: 48px;">
                  <h2 style="color: #1a1a1a; font-size: 24px;">Dear ${applicantName},</h2>
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.7;">
                    Thank you for your interest in VaultBank. After careful review, we regret to inform you that we are unable to approve your ${applicationType} application at this time.
                  </p>
                  <h3 style="color: #1a1a1a;">What You Can Do:</h3>
                  <ul style="color: #4a5568; font-size: 15px;">
                    <li>Review your credit report for accuracy</li>
                    <li>Consider reapplying after addressing any financial concerns</li>
                    <li>Contact us to discuss alternative options</li>
                  </ul>
                  <p style="color: #4a5568; margin-top: 32px;">
                    Sincerely,<br><strong>The VaultBank Team</strong>
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
    }

    // Send email using SendGrid API
    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: applicantEmail }],
          subject: subject
        }],
        from: {
          email: "info@vaulteonline.com",
          name: "VaultBank"
        },
        content: [{
          type: "text/html",
          value: htmlContent
        }]
      })
    });

    const responseBody = await emailResponse.text();
    console.log("SendGrid Response Status:", emailResponse.status);

    if (!emailResponse.ok) {
      console.error("SendGrid API error:", responseBody);
      throw new Error(`SendGrid API error: ${emailResponse.status}`);
    }

    console.log("✅ Application decision email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-application-decision function:", error);
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
