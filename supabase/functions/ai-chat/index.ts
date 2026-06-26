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
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced system prompt for better responses
    const systemPrompt = `You are Matey, Zion Works' friendly AI assistant specializing in web development and digital solutions for New Zealand businesses, particularly in the King Country and Waikato regions.

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

Recent successful projects:
- King Country Electrical Services: 300% increase in online bookings
- Te Kuiti Farm Supply: 200% revenue growth with e-commerce platform
- Hamilton Property Group: 60% faster property sales
- Otorohanga Restaurant Chain: 45% increase in online orders

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
        functions: [
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
        ],
        function_call: 'auto'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message;

    // Handle function calls
    if (aiMessage.function_call) {
      const functionName = aiMessage.function_call.name;
      const functionArgs = JSON.parse(aiMessage.function_call.arguments);
      
      console.log('Function called:', functionName, functionArgs);
      
      // You could implement actual function handling here
      // For now, return a helpful response
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      message: aiMessage.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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