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

    // Sitewide (not per-visitor) rate limit -- no caller-identifying header
    // proved reliable in this runtime, so a per-IP scheme just collapsed into
    // one shared bucket that legitimate testing could exhaust. A single
    // generous global cap is honest about what this actually protects
    // against (a runaway loop/scraper), without ever blocking normal use.
    // Fails open on any RPC error -- a broken limiter should never take the
    // feature down.
    const { data: rateLimitOk, error: rateLimitError } = await supabaseClient.rpc('check_widget_rate_limit', {
      p_slug: 'generate-brief',
      p_max_per_minute: 30,
    });
    if (rateLimitError) {
      console.error('Rate limit check failed, allowing request:', rateLimitError);
    } else if (!rateLimitOk) {
      return new Response(JSON.stringify({ error: "Too many requests, please try again shortly" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description } = await req.json();

    if (!description) {
      throw new Error("Description is required");
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // One-shot structured extraction: map free text onto the same enums the
    // classic QuoteWizard steps already use, so submit-quote needs no changes
    // to its own logic -- only a new source field passed through.
    // tool_config forces Gemini to always call draft_brief (mode: 'ANY'),
    // equivalent to OpenAI's function_call: { name: 'draft_brief' }.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: description }] }],
          systemInstruction: {
            parts: [{
              text: `You turn a visitor's plain-English project description into a structured brief for a web/app development agency. Always call draft_brief with your best-guess classification -- never ask clarifying questions, just make a reasonable estimate. If the description is vague, lean toward the more common/likely option rather than the most expensive one.`,
            }],
          },
          generationConfig: { maxOutputTokens: 400 },
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'draft_brief',
                  description: "Structure the visitor's project description into a quote brief",
                  parameters: {
                    type: 'OBJECT',
                    properties: {
                      project_type: {
                        type: 'STRING',
                        enum: ['website', 'app', 'ai', 'custom'],
                        description: 'website = business site/e-commerce/landing page, app = mobile app, ai = chatbot/automation/AI integration, custom = CRM/booking/bespoke software',
                      },
                      timeline: {
                        type: 'STRING',
                        enum: ['urgent', 'standard', 'flexible'],
                        description: 'urgent = 2-4 weeks, standard = 1-2 months, flexible = 3+ months. Default to standard if not mentioned.',
                      },
                      budget: {
                        type: 'STRING',
                        enum: ['small', 'medium', 'large', 'enterprise'],
                        description: 'small = $2k-5k, medium = $5k-15k, large = $15k-50k, enterprise = $50k+. Default to medium if not mentioned.',
                      },
                      summary: {
                        type: 'STRING',
                        description: 'A 1-2 sentence plain-English summary of what they want built, for the founder to skim.',
                      },
                    },
                    required: ['project_type', 'timeline', 'budget', 'summary'],
                  },
                },
              ],
            },
          ],
          tool_config: {
            function_calling_config: { mode: 'ANY', allowed_function_names: ['draft_brief'] },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate brief');
    }

    const data = await response.json();
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (!functionCall) {
      throw new Error('AI did not return a structured brief');
    }

    const brief = functionCall.args;

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
