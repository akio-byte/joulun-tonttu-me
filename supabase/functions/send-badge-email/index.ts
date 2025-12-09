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
    const configuredBadgeId = Deno.env.get("OBF_BADGE_ID");
    
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

    const emailBody = [
      `Hei ${name}!`,
      "",
      "Onnittelut! Olet ansainnut Joulun Osaaja -osaamismerkin Eduro Pikkujoulukioskissa.",
      "",
      "Voit tarkastella ja jakaa osaamismerkkiäsi alla olevan linkin kautta.",
      "",
      "Hyvää joulua!",
    ].join("\\n");

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

    // Step 2: Resolve badge template ID (prefer explicit env configuration)
    console.log("Resolving badge template...");
    let badgeId = configuredBadgeId;

    if (!badgeId) {
      const badgesResponse = await fetch(`${OBF_API_BASE}/v1/badge/${clientId}`, {
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

      const badgeText = await badgesResponse.text();
      let badges: Array<{ id: string; name?: string }> = [];

      try {
        const parsed = JSON.parse(badgeText);
        if (Array.isArray(parsed)) {
          badges = parsed;
        } else {
          throw new Error("Badge response was not an array");
        }
      } catch (jsonError) {
        try {
          badges = badgeText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => JSON.parse(line));
        } catch (ldJsonError) {
          console.error("Failed to parse badges list:", jsonError, ldJsonError);
          return new Response(
            JSON.stringify({ success: false, error: "Invalid badge data received" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      console.log("Available badges count:", badges.length);

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
    } else {
      console.log("Using configured badge ID:", badgeId);
    }

    // Step 3: Issue the badge to the recipient with email notification
    console.log(`Issuing badge for: ${email}, name: ${name}`);

    const issueResponse = await fetch(`${OBF_API_BASE}/v1/badge/${clientId}/${badgeId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: [email],
        send_email: true,
        email_subject: "Onnittelut! Sait Joulun Osaaja -osaamismerkin!",
        email_body: emailBody,
        email_footer: "Eduro - Joulun Osaaja",
        email_link_text: "Avaa osaamismerkki",
      }),
    });

    console.log("Badge issuance response status:", issueResponse.status);

    if (!issueResponse.ok) {
      const errorText = await issueResponse.text();
      console.error("Failed to issue badge:", issueResponse.status, errorText);
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
