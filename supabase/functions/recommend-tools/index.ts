import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, budget, requirements } = await req.json();

    if (!task) {
      return new Response(
        JSON.stringify({ error: "Task description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all tools
    const { data: tools, error: toolsError } = await supabase
      .from("ai_tools")
      .select("*")
      .order("rating", { ascending: false });

    if (toolsError) throw toolsError;

    // Get AI recommendation using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI tool recommendation expert. Analyze the user's task and requirements to recommend the top 3 most suitable AI tools from the provided list.

Consider:
1. Task requirements and tool capabilities
2. Budget constraints
3. Special requirements (API access, privacy, etc.)
4. Tool ratings and popularity
5. Pricing model fit

For each recommendation, provide:
- tool_id: the ID of the recommended tool
- reasoning: 2-3 sentences explaining why this tool is a great fit
- match_score: A score from 1-100 indicating how well this tool matches the requirements
- pros: Array of 2-3 key advantages
- cons: Array of 1-2 potential drawbacks
- alternatives: Array of 1-2 alternative tool IDs if this one doesn't work out

Respond with a JSON object containing a "recommendations" array with exactly 3 recommendations.`;

    const userPrompt = `Task: ${task}
Budget: ${budget || "Not specified"}
Requirements: ${requirements || "None specified"}

Available Tools:
${tools.map((t: any) => `- ${t.name} (ID: ${t.id}): ${t.description}. Category: ${t.category}. Pricing: ${t.pricing} ${t.pricing_details ? `(${t.pricing_details})` : ""}. Rating: ${t.rating}. ${t.has_api ? "Has API." : ""} Tasks: ${t.tasks?.join(", ")}`).join("\n")}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from AI");
    }

    let parsedRecommendations;
    try {
      const parsed = JSON.parse(aiContent);
      // Handle both array and object with recommendations array
      parsedRecommendations = Array.isArray(parsed) ? parsed : (parsed.recommendations || []);
    } catch (e) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Invalid AI response format");
    }

    // Match recommended tools with full tool data
    const recommendations = parsedRecommendations
      .slice(0, 3)
      .map((rec: any) => {
        const tool = tools.find((t: any) => t.id === rec.tool_id);
        if (!tool) return null;
        
        // Get alternative tools
        const alternatives = (rec.alternatives || [])
          .map((altId: string) => tools.find((t: any) => t.id === altId))
          .filter((t: any) => t !== undefined);
        
        return {
          tool,
          reasoning: rec.reasoning,
          match_score: rec.match_score || 85,
          pros: rec.pros || [],
          cons: rec.cons || [],
          alternatives,
        };
      })
      .filter((rec: any) => rec !== null);

    // If AI recommendations failed or didn't match tools, fall back to simple scoring
    if (recommendations.length === 0) {
      console.log("Using fallback recommendation logic");
      const scored = tools.map((tool: any) => {
        let score = tool.rating * 20 + (tool.popularity_score / 1000);

        // Budget matching
        if (budget === "free" && tool.pricing === "free") score += 50;
        if (budget === "under_20" && (tool.pricing === "free" || tool.pricing === "freemium")) score += 30;

        // API requirement
        if (requirements?.toLowerCase().includes("api") && tool.has_api) score += 30;

        return {
          tool,
          score,
          match_score: Math.min(100, Math.round(score)),
          reasoning: `This tool has a ${tool.rating} rating and is popular with ${tool.popularity_score.toLocaleString()} users. It offers ${tool.tasks?.slice(0, 3).join(", ")} capabilities.`,
          pros: [
            `High rating of ${tool.rating}`,
            `${tool.popularity_score.toLocaleString()} active users`,
          ],
          cons: [],
          alternatives: [],
        };
      });

      scored.sort((a: any, b: any) => b.score - a.score);
      recommendations.push(...scored.slice(0, 3));
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in recommend-tools function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
