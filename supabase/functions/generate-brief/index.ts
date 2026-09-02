import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

// Pure classification step only -- does NOT save to the database or send email.
// The visitor still reviews the pre-filled result and submits via the existing
// submit-quote flow (with source: 'ai_brief'), so there is exactly one place
// a quote actually gets persisted, not two.
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Basic per-IP rate limit -- this is unauthenticated and public-facing.
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { data: rateLimitOk } = await supabaseClient.rpc('check_widget_rate_limit', {
      p_slug: `generate-brief:${clientIp}`,
      p_max_per_minute: 5,
    });
    if (!rateLimitOk) {
      return new Response(JSON.stringify({ error: "Too many requests, please try again shortly" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description } = await req.json();

    if (!description) {
      throw new Error("Description is required");
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // One-shot structured extraction: map free text onto the same enums the
    // classic QuoteWizard steps already use, so submit-quote needs no changes
    // to its own logic -- only a new source field passed through.
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You turn a visitor's plain-English project description into a structured brief for a web/app development agency. Always call draft_brief with your best-guess classification -- never ask clarifying questions, just make a reasonable estimate. If the description is vague, lean toward the more common/likely option rather than the most expensive one.`,
          },
          { role: 'user', content: description },
        ],
        max_completion_tokens: 400,
        functions: [
          {
            name: 'draft_brief',
            description: 'Structure the visitor\'s project description into a quote brief',
            parameters: {
              type: 'object',
              properties: {
                project_type: {
                  type: 'string',
                  enum: ['website', 'app', 'ai', 'custom'],
                  description: 'website = business site/e-commerce/landing page, app = mobile app, ai = chatbot/automation/AI integration, custom = CRM/booking/bespoke software',
                },
                timeline: {
                  type: 'string',
                  enum: ['urgent', 'standard', 'flexible'],
                  description: 'urgent = 2-4 weeks, standard = 1-2 months, flexible = 3+ months. Default to standard if not mentioned.',
                },
                budget: {
                  type: 'string',
                  enum: ['small', 'medium', 'large', 'enterprise'],
                  description: 'small = $2k-5k, medium = $5k-15k, large = $15k-50k, enterprise = $50k+. Default to medium if not mentioned.',
                },
                summary: {
                  type: 'string',
                  description: 'A 1-2 sentence plain-English summary of what they want built, for the founder to skim.',
                },
              },
              required: ['project_type', 'timeline', 'budget', 'summary'],
            },
          },
        ],
        function_call: { name: 'draft_brief' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate brief');
    }

    const data = await response.json();
    const functionCall = data.choices[0].message.function_call;

    if (!functionCall) {
      throw new Error('AI did not return a structured brief');
    }

    const brief = JSON.parse(functionCall.arguments);

    return new Response(
      JSON.stringify({
        project_type: brief.project_type,
        timeline: brief.timeline,
        budget: brief.budget,
        summary: brief.summary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate-brief function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate brief", details: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
