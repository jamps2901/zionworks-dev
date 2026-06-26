import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Realtime chat function called');
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Making request to OpenAI realtime sessions endpoint');

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are Matey, Zion Works' friendly AI assistant specializing in web development and digital solutions for New Zealand businesses, particularly in the King Country and Waikato regions.

Your expertise includes:
- Web development (React, Next.js, TypeScript, Tailwind CSS)
- E-commerce platforms and online stores
- Mobile app development 
- AI integration and automation
- Digital marketing and SEO
- Local business solutions

You help with:
- Project planning and quotes
- Technical consultations
- Booking appointments with the Zion Works team
- Explaining services and capabilities
- Providing development insights

Your personality:
- Friendly, approachable, and professional
- Use occasional Kiwi expressions naturally
- Focus on practical, business-oriented solutions
- Always helpful and knowledgeable
- Speak conversationally but stay professional

Available functions:
- get_quote: Help users get project quotes
- book_consultation: Schedule meetings with the team
- get_portfolio_info: Provide details about past projects
- check_availability: Check team availability

Keep responses concise but informative. Always offer to help with next steps like getting quotes or booking consultations.`
      }),
    });

    const data = await response.json();
    console.log("Realtime session created successfully:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating realtime session:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Failed to create OpenAI realtime session"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});