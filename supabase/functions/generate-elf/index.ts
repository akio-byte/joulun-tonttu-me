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
    const { photoBase64, userWish, name, aiApiKey } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Score is based on participation (8-10 range for everyone who completes)
    const score = Math.floor(Math.random() * 3) + 8;

    // Determine elf role based on score
    let roleHint = "Joulun Osaaja";
    if (score >= 10) roleHint = "Mestari-tonttu";
    else if (score >= 9) roleHint = "Joulu-taikuri";
    else roleHint = "Lahja-tonttu";

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
            content: "Olet hauska jouluinen AI joka luo lyhyitä tonttukuvauksia. Vastaa VAIN suomeksi. Pidä vastaus alle 40 sanaa. Ole lämmin ja positiivinen.",
          },
          {
            role: "user",
            content: `Luo hauska ja lämmin tontturoolin kuvaus henkilölle nimeltä ${name}. Rooli: ${roleHint}. Kuvaus on positiivinen ja jouluinen. Älä mainitse pisteitä tekstissä.`,
          },
        ],
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error("Text generation failed:", errorText);
      throw new Error("Text generation failed");
    }

    const textData = await textResponse.json();
    const description =
      textData.choices?.[0]?.message?.content ||
      `${name}, olet aito ${roleHint}! Sinussa asuu jouluhenki ja tiimityön taika. Joulumielessäsi on aina tilaa iloisille yllätyksille.`;

    console.log("Description generated successfully");

    // Generate mystical phrase based on user's wish
    let mysticalPhrase = "";
    if (userWish && userWish.trim()) {
      try {
        const phraseResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: "Olet mystinen joulutonttu. Luo yksi lyhyt, runollinen lause (max 20 sanaa) suomeksi, joka kuvaa käyttäjän toivetta symbolisesti ja mystisesti. Älä toista toivetta suoraan. Ole luova ja taianomäinen.",
              },
              {
                role: "user",
                content: `Käyttäjän toive: "${userWish}". Luo symbolinen, mystinen lause tästä toiveesta.`,
              },
            ],
          }),
        });

        if (phraseResponse.ok) {
          const phraseData = await phraseResponse.json();
          mysticalPhrase = phraseData.choices?.[0]?.message?.content || "";
          // Clean up the phrase
          mysticalPhrase = mysticalPhrase.replace(/^["']|["']$/g, "").trim();
          console.log("Mystical phrase generated:", mysticalPhrase);
        }
      } catch (e) {
        console.error("Mystical phrase generation failed:", e);
        // Fallback phrase
        mysticalPhrase = `Tämä tonttu kantaa mukanaan unelmaa uusista seikkailuista.`;
      }
    }

    // Edit user's photo to add Christmas elf elements
    const imagePrompt = userWish
      ? `Muokkaa tätä valokuvaa jouluisemmaksi: lisää henkilölle punainen tonttulakki päähän, punaiset posket, ja jouluinen lämmin valaistus. Lisää taustalle lumisia kuusia ja tähtiä. Lisää taustaan pieni symbolinen elementti joka edustaa toivetta "${userWish.substring(0, 50)}" - esim. ikoni tai kuvioita (ei tekstiä). TÄRKEÄÄ: Säilytä henkilön kasvot ja ulkonäkö täysin tunnistettavana.`
      : `Muokkaa tätä valokuvaa jouluisemmaksi: lisää henkilölle punainen tonttulakki päähän, punaiset posket, ja jouluinen lämmin valaistus. Lisää taustalle lumisia kuusia ja tähtiä. TÄRKEÄÄ: Säilytä henkilön kasvot ja ulkonäkö täysin tunnistettavana.`;

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
                text: imagePrompt,
              },
              {
                type: "image_url",
                image_url: { url: photoBase64 },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
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
        mysticalPhrase,
        score,
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
        fallback: true,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
