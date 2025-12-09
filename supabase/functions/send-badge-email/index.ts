import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    
    const clientId = Deno.env.get("OBF_CLIENT_ID");
    const clientSecret = Deno.env.get("OBF_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error("OBF credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Badge service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For demo: simulate badge issuance success
    // In production, integrate with OpenBadgeFactory API
    console.log(`Badge requested for: ${email}, name: ${name}`);
    
    // Simulated success response
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Send badge error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
