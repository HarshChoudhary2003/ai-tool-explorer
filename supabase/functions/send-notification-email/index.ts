import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 email requests per minute per IP

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIdentifier(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

interface EmailRequest {
  type: "tool_submission" | "contact" | "newsletter_welcome";
  data: Record<string, string>;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit check
  const clientIp = getClientIdentifier(req);
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ success: false, error: "Too many requests. Please try again in a minute." }),
      { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { type, data }: EmailRequest = await req.json();
    console.log(`Processing email notification: ${type}`, data);

    let emailConfig: {
      to: string[];
      subject: string;
      html: string;
    };

    switch (type) {
      case "tool_submission":
        // Send confirmation to submitter
        emailConfig = {
          to: [data.email],
          subject: "Tool Submission Received - AI Tools Explorer",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                .tool-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Tool Submission Received!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.name || "there"},</p>
                  <p>Thank you for submitting <strong>${data.toolName}</strong> to AI Tools Explorer! We've received your submission and our team will review it shortly.</p>
                  <div class="tool-info">
                    <p><strong>Tool Name:</strong> ${data.toolName}</p>
                    <p><strong>Website:</strong> ${data.website}</p>
                    <p><strong>Category:</strong> ${data.category}</p>
                  </div>
                  <p>We'll notify you once your tool has been reviewed. This usually takes 2-3 business days.</p>
                  <p>Best regards,<br>The AI Tools Explorer Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} AI Tools Explorer. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        };
        break;

      case "contact":
        // Send confirmation to person who contacted
        emailConfig = {
          to: [data.email],
          subject: "We received your message - AI Tools Explorer",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📬 Message Received!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.name},</p>
                  <p>Thank you for reaching out to us! We've received your message and will get back to you as soon as possible.</p>
                  <div class="message-box">
                    <p><strong>Subject:</strong> ${data.subject || "General Inquiry"}</p>
                    <p><strong>Your Message:</strong></p>
                    <p>${data.message}</p>
                  </div>
                  <p>We typically respond within 24-48 hours.</p>
                  <p>Best regards,<br>The AI Tools Explorer Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} AI Tools Explorer. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        };
        break;

      case "newsletter_welcome":
        emailConfig = {
          to: [data.email],
          subject: "Welcome to AI Tools Explorer Newsletter! 🚀",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; border-radius: 12px 12px 0 0; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .header p { color: rgba(255,255,255,0.9); margin-top: 10px; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .benefits ul { margin: 0; padding-left: 20px; }
                .benefits li { margin: 10px 0; }
                .cta { text-align: center; margin: 30px 0; }
                .cta a { background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome Aboard! 🎉</h1>
                  <p>You're now part of the AI Tools Explorer community</p>
                </div>
                <div class="content">
                  <p>Hey there!</p>
                  <p>Thanks for subscribing to our newsletter. You're now on the list to receive:</p>
                  <div class="benefits">
                    <ul>
                      <li>🔥 Weekly roundups of the hottest new AI tools</li>
                      <li>💡 Expert tips and tutorials</li>
                      <li>🎁 Exclusive deals and early access</li>
                      <li>📊 Industry insights and trends</li>
                    </ul>
                  </div>
                  <div class="cta">
                    <a href="https://aitools.example.com/tools">Explore AI Tools</a>
                  </div>
                  <p>Stay curious,<br>The AI Tools Explorer Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} AI Tools Explorer. All rights reserved.</p>
                  <p><small>You're receiving this because you subscribed at AI Tools Explorer.</small></p>
                </div>
              </div>
            </body>
            </html>
          `,
        };
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    console.log(`Sending email to: ${emailConfig.to.join(", ")}`);
    
    const emailResponse = await resend.emails.send({
      from: "AI Tools Explorer <onboarding@resend.dev>",
      ...emailConfig,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});