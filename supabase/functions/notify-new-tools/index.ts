import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 2; // 2 requests per minute (this is typically called by cron)

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

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  website_url: string;
  pricing: string;
}

interface UserInterest {
  user_id: string;
  category: string;
  email_notifications: boolean;
}

interface Profile {
  user_id: string;
  email: string | null;
  display_name: string | null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
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
    console.log("Starting new tools notification check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for hours lookback (default 24)
    let hoursBack = 24;
    try {
      const body = await req.json();
      hoursBack = body.hours_back || 24;
    } catch {
      // Use default
    }

    // Get tools added in the last X hours
    const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
    
    const { data: newTools, error: toolsError } = await supabase
      .from("ai_tools")
      .select("*")
      .gte("created_at", cutoffDate);

    if (toolsError) {
      console.error("Error fetching new tools:", toolsError);
      throw toolsError;
    }

    if (!newTools || newTools.length === 0) {
      console.log("No new tools found in the specified time range");
      return new Response(
        JSON.stringify({ success: true, message: "No new tools to notify about" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${newTools.length} new tools`);

    // Group new tools by category
    const toolsByCategory: Record<string, Tool[]> = {};
    newTools.forEach((tool: Tool) => {
      if (!toolsByCategory[tool.category]) {
        toolsByCategory[tool.category] = [];
      }
      toolsByCategory[tool.category].push(tool);
    });

    // Get users interested in these categories
    const categories = Object.keys(toolsByCategory);
    const { data: interests, error: interestsError } = await supabase
      .from("user_category_interests")
      .select("*")
      .in("category", categories)
      .eq("email_notifications", true);

    if (interestsError) {
      console.error("Error fetching interests:", interestsError);
      throw interestsError;
    }

    if (!interests || interests.length === 0) {
      console.log("No users interested in these categories");
      return new Response(
        JSON.stringify({ success: true, message: "No interested users found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profiles for email addresses
    const userIds = [...new Set(interests.map((i: UserInterest) => i.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .in("user_id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Build notifications per user
    const userNotifications: Record<string, { 
      profile: Profile; 
      tools: Tool[];
      categories: Set<string>;
    }> = {};

    interests.forEach((interest: UserInterest) => {
      const profile = profiles?.find((p: Profile) => p.user_id === interest.user_id);
      if (!profile?.email) return;

      if (!userNotifications[interest.user_id]) {
        userNotifications[interest.user_id] = {
          profile,
          tools: [],
          categories: new Set(),
        };
      }

      const categoryTools = toolsByCategory[interest.category] || [];
      categoryTools.forEach((tool: Tool) => {
        if (!userNotifications[interest.user_id].tools.find((t: Tool) => t.id === tool.id)) {
          userNotifications[interest.user_id].tools.push(tool);
        }
      });
      userNotifications[interest.user_id].categories.add(interest.category);
    });

    // Send emails
    let sentCount = 0;
    let errorCount = 0;

    for (const [userId, notification] of Object.entries(userNotifications)) {
      if (notification.tools.length === 0) continue;

      // Check if we've already notified about these tools
      const toolIds = notification.tools.map((t: Tool) => t.id);
      const { data: existingLogs } = await supabase
        .from("tool_notifications_log")
        .select("tool_id")
        .eq("user_id", userId)
        .in("tool_id", toolIds);

      const alreadyNotified = new Set(existingLogs?.map((l: { tool_id: string }) => l.tool_id) || []);
      const newToolsToNotify = notification.tools.filter((t: Tool) => !alreadyNotified.has(t.id));

      if (newToolsToNotify.length === 0) {
        console.log(`User ${userId} already notified about these tools`);
        continue;
      }

      const formatCategory = (cat: string) => 
        cat.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

      const toolsHtml = newToolsToNotify.map((tool: Tool) => `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #6366f1;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${tool.name}</h3>
          <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">${tool.description.slice(0, 150)}...</p>
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; color: #6366f1;">
              ${formatCategory(tool.category)}
            </span>
            <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; color: #666;">
              ${tool.pricing}
            </span>
          </div>
          <a href="${tool.website_url}" style="color: #6366f1; text-decoration: none; font-weight: 600; font-size: 14px;">
            Learn More →
          </a>
        </div>
      `).join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .header p { color: rgba(255,255,255,0.9); margin-top: 10px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 New AI Tools Alert!</h1>
              <p>${newToolsToNotify.length} new ${newToolsToNotify.length === 1 ? 'tool' : 'tools'} in your favorite categories</p>
            </div>
            <div class="content">
              <p>Hey ${notification.profile.display_name || "there"}!</p>
              <p>Great news! We've added some exciting new AI tools in categories you're following:</p>
              ${toolsHtml}
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://aitools.example.com/tools" style="background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                  Explore All Tools
                </a>
              </div>
              <p style="margin-top: 30px;">Happy exploring!<br>The AI Tools Explorer Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AI Tools Explorer. All rights reserved.</p>
              <p><small>You're receiving this because you subscribed to category alerts.</small></p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await resend.emails.send({
          from: "AI Tools Explorer <onboarding@resend.dev>",
          to: [notification.profile.email!],
          subject: `🚀 ${newToolsToNotify.length} New AI ${newToolsToNotify.length === 1 ? 'Tool' : 'Tools'} in Your Categories!`,
          html: emailHtml,
        });

        // Log sent notifications
        const logEntries = newToolsToNotify.map((tool: Tool) => ({
          user_id: userId,
          tool_id: tool.id,
        }));

        await supabase.from("tool_notifications_log").insert(logEntries);

        sentCount++;
        console.log(`Sent notification to user ${userId}`);
      } catch (emailError) {
        console.error(`Error sending email to user ${userId}:`, emailError);
        errorCount++;
      }
    }

    console.log(`Notification complete. Sent: ${sentCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        errors: errorCount,
        new_tools: newTools.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-new-tools:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
