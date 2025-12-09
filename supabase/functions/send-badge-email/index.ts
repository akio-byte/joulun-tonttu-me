import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

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

    if (!email || !name) {
      return new Response(
        JSON.stringify({ success: false, error: "Email and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OBF_API_BASE = "https://openbadgefactory.com";
    
    // Step 1: Get OAuth2 access token using client credentials
    console.log("Requesting OBF access token...");
    
    const tokenResponse = await fetch(`${OBF_API_BASE}/v1/client/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Failed to get access token:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to authenticate with badge service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData: TokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("Access token received successfully");

    // Step 2: Get badge template ID (using client ID as issuer)
    // The badge ID should be configured - for now we'll use a default pattern
    const issuerId = clientId.split("@")[0]; // Extract issuer from client_id format
    
    // Step 3: Issue the badge with email notification enabled
    console.log(`Issuing badge for: ${email}, name: ${name}`);
    
    // First, get available badges for this issuer
    const badgesResponse = await fetch(`${OBF_API_BASE}/v1/badge/${issuerId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Badges list response status:", badgesResponse.status);

    if (!badgesResponse.ok) {
      const errorText = await badgesResponse.text();
      console.error("Failed to get badges list:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to retrieve badge templates" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const badges = await badgesResponse.json();
    console.log("Available badges count:", Array.isArray(badges) ? badges.length : "N/A");

    // Find the Joulun Osaaja badge or use the first available badge
    let badgeId = null;
    if (Array.isArray(badges) && badges.length > 0) {
      const jouluBadge = badges.find((b: { name?: string }) => 
        b.name?.toLowerCase().includes("joulun") || 
        b.name?.toLowerCase().includes("osaaja")
      );
      badgeId = jouluBadge?.id || badges[0].id;
      console.log("Selected badge ID:", badgeId);
    } else {
      console.error("No badges found for issuer");
      return new Response(
        JSON.stringify({ success: false, error: "No badge templates configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Issue the badge to the recipient with email notification
    const issueResponse = await fetch(`${OBF_API_BASE}/v1/badge/${issuerId}/${badgeId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: [
          {
            recipient_email: email,
            recipient_name: name,
          }
        ],
        email_subject: "Onnittelut! Sait Joulun Osaaja -osaamismerkin!",
        email_body: `Hei ${name}!\n\nOnnittelut! Olet ansainnut Joulun Osaaja -osaamismerkin Eduro Pikkujoulukioskissa.\n\nVoit tarkastella ja jakaa osaamismerkkiäsi alla olevan linkin kautta.\n\nHyvää joulua!`,
        email_footer: "Eduro - Joulun Osaaja",
        email_link_text: "Avaa osaamismerkki",
        notify: true,
        log_entry: {
          add_log_entry: true,
          log_entry_text: `Badge issued via Joulun Osaaja kiosk for ${name}`,
        }
      }),
    });

    console.log("Badge issuance response status:", issueResponse.status);

    if (!issueResponse.ok) {
      const errorText = await issueResponse.text();
      console.error("Failed to issue badge:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to issue badge" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const issueResult = await issueResponse.json();
    console.log("Badge issued successfully:", JSON.stringify(issueResult));

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
