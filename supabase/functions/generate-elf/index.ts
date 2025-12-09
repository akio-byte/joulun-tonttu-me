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
    const { photoBase64, answers, score, name } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Determine elf role based on score
    let roleHint = "Tiimi-tonttu";
    if (score >= 13) roleHint = "Mestari-tonttu";
    else if (score >= 10) roleHint = "Joulu-taikuri";
    else if (score >= 7) roleHint = "Lahja-tonttu";
    else roleHint = "Apuri-tonttu";

    // Generate description with text model
    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Olet hauska jouluinen AI joka luo lyhyitä tonttukuvauksia. Vastaa VAIN suomeksi. Pidä vastaus alle 50 sanaa."
          },
          {
            role: "user",
            content: `Luo hauska ja lämmin tontturoolin kuvaus henkilölle nimeltä ${name}. Rooli: ${roleHint}. Pisteet: ${score}/15. Kuvaus on positiivinen ja jouluinen.`
          }
        ],
      }),
    });

    if (!textResponse.ok) {
      console.error("Text generation failed:", await textResponse.text());
      throw new Error("Text generation failed");
    }

    const textData = await textResponse.json();
    const description = textData.choices?.[0]?.message?.content || 
      `${name}, olet aito ${roleHint}! Sinussa asuu jouluhenki ja tiimityön taika.`;

    // Generate elf image
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transform this person into a friendly Christmas elf with a red and green elf hat, pointy ears, rosy cheeks, and festive outfit. Keep their face recognizable. Cartoon style, warm Christmas lighting, magical sparkles."
              },
              {
                type: "image_url",
                image_url: { url: photoBase64 }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    let elfImageBase64 = photoBase64; // Fallback to original photo
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (generatedImage) {
        elfImageBase64 = generatedImage;
      }
    } else {
      console.error("Image generation failed, using original photo");
    }

    return new Response(
      JSON.stringify({
        elfImageBase64,
        title: roleHint,
        description,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generate elf error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
