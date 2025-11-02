import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
          subject = "Your Account Application Has Been Approved! 🎉";
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Congratulations, ${applicantName}!</h1>
              <p>We're excited to inform you that your ${accountType} account application has been <strong>approved</strong>!</p>
              <p>Your new account will be set up within the next 24-48 hours. You'll receive another email with your account details and login instructions.</p>
              <h3>What's Next?</h3>
              <ul>
                <li>Check your email for account setup instructions</li>
                <li>Download our mobile app for easy access</li>
                <li>Explore our online banking features</li>
              </ul>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              <p style="margin-top: 40px;">Best regards,<br><strong>VaultBank Team</strong></p>
            </div>
          `;
          break;
        case "card":
          subject = "Your Card Application Has Been Approved! 💳";
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Great News, ${applicantName}!</h1>
              <p>Your ${cardType} card application has been <strong>approved</strong>!</p>
              <p>Your new card will be mailed to your address within 5-7 business days.</p>
              <h3>What to Expect:</h3>
              <ul>
                <li>Your card will arrive in a secure envelope</li>
                <li>Activate your card online or by phone</li>
                <li>Start enjoying your card benefits immediately after activation</li>
              </ul>
              <p>Thank you for choosing VaultBank!</p>
              <p style="margin-top: 40px;">Best regards,<br><strong>VaultBank Team</strong></p>
            </div>
          `;
          break;
        case "loan":
          subject = "Your Loan Application Has Been Approved! ✅";
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Approved, ${applicantName}!</h1>
              <p>We're pleased to inform you that your loan application for <strong>$${loanAmount?.toLocaleString()}</strong> has been <strong>approved</strong>!</p>
              <p>Our loan specialist will contact you within 1-2 business days to finalize the details and discuss the next steps.</p>
              <h3>Next Steps:</h3>
              <ul>
                <li>Review your loan terms and conditions</li>
                <li>Complete any required documentation</li>
                <li>Set up your payment schedule</li>
              </ul>
              <p>We look forward to helping you achieve your financial goals.</p>
              <p style="margin-top: 40px;">Best regards,<br><strong>VaultBank Team</strong></p>
            </div>
          `;
          break;
      }
    } else {
      // Rejected
      subject = `Update on Your ${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} Application`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Application Status Update</h1>
          <p>Dear ${applicantName},</p>
          <p>Thank you for your interest in VaultBank. After careful review, we regret to inform you that we are unable to approve your ${applicationType} application at this time.</p>
          <p>This decision was based on several factors, including but not limited to credit history, income verification, and current financial obligations.</p>
          <h3>What You Can Do:</h3>
          <ul>
            <li>Review your credit report for accuracy</li>
            <li>Consider reapplying after addressing any financial concerns</li>
            <li>Contact us to discuss alternative options</li>
          </ul>
          <p>We appreciate your interest in VaultBank and encourage you to reach out to our customer service team if you have any questions.</p>
          <p style="margin-top: 40px;">Sincerely,<br><strong>VaultBank Team</strong></p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "VaultBank <onboarding@resend.dev>",
      to: [applicantEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
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
