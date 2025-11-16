import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomJointEmailRequest {
  requestId: string;
  accountHolderEmail: string;
  partnerEmail: string;
  subject: string;
  content: string;
  trackingNumber?: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      accountHolderEmail,
      partnerEmail,
      subject,
      content,
      trackingNumber,
    }: CustomJointEmailRequest = await req.json();

    console.log("Sending custom joint account emails...");

    // Format content with tracking info if provided
    const formattedContent = trackingNumber
      ? `${content}\n\n---\nTracking Number: ${trackingNumber}\nYou can use this tracking number to monitor your document shipment.`
      : content;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; white-space: pre-wrap; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .tracking { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏦 VaultBank</h1>
              <p>Joint Account Agreement</p>
            </div>
            <div class="content">
              ${formattedContent.replace(/\n/g, '<br>')}
              ${trackingNumber ? `
                <div class="tracking">
                  <strong>📦 Tracking Information</strong><br>
                  Tracking Number: <strong>${trackingNumber}</strong>
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p><strong>VaultBank - Secure Banking Solutions</strong></p>
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>For support, contact us at info@vaulteonline.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to account holder
    const holderResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VaultBank <onboarding@resend.dev>",
        to: [accountHolderEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!holderResponse.ok) {
      const error = await holderResponse.text();
      throw new Error(`Failed to send email to account holder: ${error}`);
    }

    const holderData = await holderResponse.json();
    console.log("Email sent to account holder:", holderData);

    // Send to partner
    const partnerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VaultBank <onboarding@resend.dev>",
        to: [partnerEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!partnerResponse.ok) {
      const error = await partnerResponse.text();
      throw new Error(`Failed to send email to partner: ${error}`);
    }

    const partnerData = await partnerResponse.json();
    console.log("Email sent to partner:", partnerData);

    return new Response(
      JSON.stringify({
        success: true,
        holderEmailId: holderData.id,
        partnerEmailId: partnerData.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending custom joint account emails:", error);
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
