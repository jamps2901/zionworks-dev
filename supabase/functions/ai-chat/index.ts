import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_ORIGINS = [
  'https://zionworks.dev',
  'https://www.zionworks.dev',
  'https://zionworks-dev.jrpatnugot29.workers.dev',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

const ZION_WORKS_SYSTEM_PROMPT = `You are Matey, Zion Works' friendly AI assistant specializing in web development and digital solutions for New Zealand businesses, particularly in the King Country and Waikato regions.

Your expertise includes:
- Web development (React, Next.js, TypeScript, Tailwind CSS)
- E-commerce platforms and online stores
- Mobile app development
- AI integration and automation
- Digital marketing and SEO
- Local business solutions

Services Zion Works offers:
- Custom website development ($3,000 - $15,000)
- E-commerce platforms ($5,000 - $25,000)
- Mobile app development ($8,000 - $30,000)
- AI chatbot integration ($2,000 - $8,000)
- Digital marketing campaigns ($1,500 - $5,000/month)
- Website maintenance ($200 - $800/month)

You help with:
- Project planning and quotes
- Technical consultations
- Booking appointments
- Explaining services and capabilities
- Providing development insights

Your personality:
- Friendly, professional, and knowledgeable
- Use occasional Kiwi expressions naturally ("G'day", "choice", "sweet as")
- Focus on practical business solutions
- Always offer concrete next steps

Keep responses helpful but concise. Always offer to help with quotes or consultations.`;

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, clientSlug } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = ZION_WORKS_SYSTEM_PROMPT;
    let openaiModel = 'gpt-5-2025-08-07';
    let allowFunctionCalls = true;
    let tenantCorsHeaders = corsHeaders;

    // Tenant-aware path: this is what the embeddable widget (/w/:slug on a
    // third-party site) calls. Falls through to the Zion Works default above
    // when clientSlug is absent, so the existing on-site ChatBot.tsx is unaffected.
    if (clientSlug) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: widgetClient, error: lookupError } = await supabaseClient
        .from("widget_clients")
        .select("slug, allowed_origins, system_prompt, openai_model, is_active")
        .eq("slug", clientSlug)
        .single();

      if (lookupError || !widgetClient || !widgetClient.is_active) {
        return new Response(JSON.stringify({ error: "Widget not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const originAllowed = requestOrigin && widgetClient.allowed_origins.includes(requestOrigin);
      if (!originAllowed) {
        return new Response(JSON.stringify({ error: "Origin not allowed for this widget" }), {
          status: 403,
          headers: { "Access-Control-Allow-Origin": "null", "Content-Type": "application/json" },
        });
      }
      // Once validated, echo back only this specific origin -- never '*' for the tenant path.
      tenantCorsHeaders = {
        'Access-Control-Allow-Origin': requestOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Vary': 'Origin',
      };

      const { data: rateLimitOk } = await supabaseClient.rpc('check_widget_rate_limit', {
        p_slug: clientSlug,
      });
      if (!rateLimitOk) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again shortly" }), {
          status: 429,
          headers: { ...tenantCorsHeaders, "Content-Type": "application/json" },
        });
      }

      systemPrompt = widgetClient.system_prompt;
      openaiModel = widgetClient.openai_model;
      allowFunctionCalls = false; // tenant path: plain chat replies only for v1
    }

    const requestBody: Record<string, unknown> = {
      model: openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_completion_tokens: 500,
    };

    if (allowFunctionCalls) {
      requestBody.functions = [
        {
          name: 'get_project_quote',
          description: 'Generate a project quote based on requirements',
          parameters: {
            type: 'object',
            properties: {
              project_type: { type: 'string', description: 'Type of project (website, ecommerce, mobile app, etc.)' },
              features: { type: 'array', items: { type: 'string' }, description: 'List of required features' },
              timeline: { type: 'string', description: 'Desired timeline' },
              budget_range: { type: 'string', description: 'Budget range' }
            },
            required: ['project_type']
          }
        },
        {
          name: 'book_consultation',
          description: 'Help user book a consultation with the Zion Works team',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'User name' },
              email: { type: 'string', description: 'User email' },
              phone: { type: 'string', description: 'User phone number' },
              service_interest: { type: 'string', description: 'Service they are interested in' }
            },
            required: ['name', 'email']
          }
        }
      ];
      requestBody.function_call = 'auto';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message;

    // Handle function calls (Zion Works' own on-site chat only -- tenant path never sets these)
    if (aiMessage.function_call) {
      const functionName = aiMessage.function_call.name;
      const functionArgs = JSON.parse(aiMessage.function_call.arguments);

      console.log('Function called:', functionName, functionArgs);

      let functionResponse = '';

      if (functionName === 'get_project_quote') {
        functionResponse = `Based on your ${functionArgs.project_type} project requirements, I'd estimate this could range from $3,000 to $15,000 depending on complexity. Would you like me to connect you with our team for a detailed quote?`;
      } else if (functionName === 'book_consultation') {
        functionResponse = `Perfect! I can help you book a consultation. Please provide your contact details and I'll have our team reach out to discuss your ${functionArgs.service_interest || 'project'} needs.`;
      }

      return new Response(JSON.stringify({
        message: functionResponse,
        function_call: aiMessage.function_call
      }), {
        headers: { ...tenantCorsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      message: aiMessage.content
    }), {
      headers: { ...tenantCorsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(JSON.stringify({
      message: "Sorry mate, I'm having a bit of trouble at the moment. You can always reach our team directly at contactus@zionworks.dev or +64223536095 for immediate assistance!",
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
