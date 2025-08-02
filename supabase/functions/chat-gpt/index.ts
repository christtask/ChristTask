/// <reference types="https://deno.land/x/deno@v1.37.0/lib.deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
if (!apiKey) {
  throw new Error("Missing OpenAI API key");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://christtask.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { message } = await req.json();

    // Call OpenAI API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a Christian apologetics assistant." },
          { role: "user", content: message }
        ],
        max_tokens: 500,
      }),
    });

    const openaiData = await openaiRes.json();
    const aiResponse = openaiData.choices?.[0]?.message?.content || "Sorry, I couldn't process that request.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}); 