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

    // Determine elf role based on score (2-10 range from 2 questions)
    let roleHint = "Tiimi-tonttu";
    if (score >= 9) roleHint = "Mestari-tonttu";
    else if (score >= 7) roleHint = "Joulu-taikuri";
    else if (score >= 5) roleHint = "Lahja-tonttu";
    else roleHint = "Apuri-tonttu";

    console.log(`Generating elf for ${name}, score: ${score}, role: ${roleHint}`);

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
            content: "Olet hauska jouluinen AI joka luo lyhyitä tonttukuvauksia. Vastaa VAIN suomeksi. Pidä vastaus alle 40 sanaa. Ole lämmin ja positiivinen."
          },
          {
            role: "user",
            content: `Luo hauska ja lämmin tontturoolin kuvaus henkilölle nimeltä ${name}. Rooli: ${roleHint}. Pisteet: ${score}/10. Kuvaus on positiivinen ja jouluinen. Älä mainitse pisteitä tekstissä.`
          }
        ],
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error("Text generation failed:", errorText);
      throw new Error("Text generation failed");
    }

    const textData = await textResponse.json();
    const description = textData.choices?.[0]?.message?.content || 
      `${name}, olet aito ${roleHint}! Sinussa asuu jouluhenki ja tiimityön taika. Joulumielessäsi on aina tilaa iloisille yllätyksille.`;

    console.log("Description generated successfully");

    // Edit user's photo to add Christmas elf elements - KEEP THE SAME PERSON
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
                text: "Muokkaa tätä valokuvaa jouluisemmaksi: lisää henkilölle punainen tonttulakki päähän, punaiset posket, ja jouluinen lämmin valaistus. Lisää taustalle lumisia kuusia ja tähtia. TÄRKEÄÄ: Säilytä henkilön kasvot ja ulkonäkö täysin tunnistettavana - tämä on sama ihminen, vain jouluisessa tunnelmassa. Pidä kuva realistisena mutta lämpimänä ja juhlavana."
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
      const editedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (editedImage) {
        elfImageBase64 = editedImage;
        console.log("Image edited successfully");
      } else {
        console.log("No edited image returned, using original");
      }
    } else {
      const errorText = await imageResponse.text();
      console.error("Image editing failed:", errorText);
      console.log("Using original photo as fallback");
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
    
    // Return fallback on error - app should not crash
    return new Response(
      JSON.stringify({ 
        error: message,
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
