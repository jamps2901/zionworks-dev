import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface QuoteSubmission {
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  platform: string;
  timeline: string;
  budget: string;
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const quoteData: QuoteSubmission = await req.json();
    
    console.log("Received quote submission:", quoteData);

    // Save to database
    const { data: quote, error: dbError } = await supabaseClient
      .from("quotes")
      .insert([
        {
          name: quoteData.name,
          email: quoteData.email,
          project_type: quoteData.projectType,
          timeline: quoteData.timeline,
          budget: quoteData.budget,
          message: `Platform: ${quoteData.platform}\n\nPhone: ${quoteData.phone || 'Not provided'}\n\nDescription: ${quoteData.description}`,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log("Quote saved to database:", quote);

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">Thanks for your quote request!</h1>
        <p>Hi ${quoteData.name},</p>
        <p>We've received your quote request and we're excited to work with you! Here's what you submitted:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Project Details</h3>
          <p><strong>Project Type:</strong> ${getProjectTypeLabel(quoteData.projectType)}</p>
          <p><strong>Platform:</strong> ${getPlatformLabel(quoteData.platform)}</p>
          <p><strong>Timeline:</strong> ${getTimelineLabel(quoteData.timeline)}</p>
          <p><strong>Budget:</strong> ${getBudgetLabel(quoteData.budget)}</p>
          ${quoteData.description ? `<p><strong>Description:</strong> ${quoteData.description}</p>` : ''}
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>We'll review your requirements within 24 hours</li>
          <li>You'll receive a detailed quote via email</li>
          <li>We can schedule a free consultation call if needed</li>
        </ul>
        
        <p>Questions? Reply to this email or call us at <a href="tel:+64271234567">+64 27 123 4567</a></p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280;">Zion Works - Digital Solutions for Kiwi Businesses</p>
          <p style="color: #6b7280;">King Country, Waikato, New Zealand</p>
        </div>
      </div>
    `;

    const { error: customerEmailError } = await resend.emails.send({
      from: "Zion Works <onboarding@resend.dev>",
      to: [quoteData.email],
      subject: "Your Quote Request - We'll be in touch soon!",
      html: customerEmailHtml,
    });

    if (customerEmailError) {
      console.error("Customer email error:", customerEmailError);
      // Don't throw here - quote is saved, just log the error
    }

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">🚨 New Quote Request!</h1>
        <p>You have a new quote request from your website:</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${quoteData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${quoteData.email}">${quoteData.email}</a></p>
          ${quoteData.phone ? `<p><strong>Phone:</strong> <a href="tel:${quoteData.phone}">${quoteData.phone}</a></p>` : ''}
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Project Details</h3>
          <p><strong>Project Type:</strong> ${getProjectTypeLabel(quoteData.projectType)}</p>
          <p><strong>Platform:</strong> ${getPlatformLabel(quoteData.platform)}</p>
          <p><strong>Timeline:</strong> ${getTimelineLabel(quoteData.timeline)}</p>
          <p><strong>Budget:</strong> ${getBudgetLabel(quoteData.budget)}</p>
          ${quoteData.description ? `<p><strong>Description:</strong> ${quoteData.description}</p>` : ''}
        </div>
        
        <p style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <strong>Action Required:</strong> Follow up within 24 hours to maintain excellent service standards!
        </p>
      </div>
    `;

    const { error: adminEmailError } = await resend.emails.send({
      from: "Zion Works <onboarding@resend.dev>",
      to: ["jrpatnugot29@gmail.com"], // Using your email for now
      subject: `🚨 New Quote Request from ${quoteData.name}`,
      html: adminEmailHtml,
    });

    if (adminEmailError) {
      console.error("Admin email error:", adminEmailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Quote submitted successfully!",
        quoteId: quote.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in submit-quote function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to submit quote", 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper functions to convert form values to readable labels
function getProjectTypeLabel(type: string): string {
  const labels = {
    'website': 'Website',
    'app': 'Mobile App', 
    'ai': 'AI Solution',
    'custom': 'Custom Software'
  };
  return labels[type] || type;
}

function getPlatformLabel(platform: string): string {
  const labels = {
    'web': 'Web Only',
    'mobile': 'Mobile Only',
    'both': 'Web + Mobile',
    'other': 'Other Platform'
  };
  return labels[platform] || platform;
}

function getTimelineLabel(timeline: string): string {
  const labels = {
    'urgent': '2-4 weeks (Rush job +20%)',
    'standard': '1-2 months (Standard timeline)',
    'flexible': '3+ months (Flexible schedule)'
  };
  return labels[timeline] || timeline;
}

function getBudgetLabel(budget: string): string {
  const labels = {
    'small': '$2,000 - $5,000 (Starter projects)',
    'medium': '$5,000 - $15,000 (Most popular)',
    'large': '$15,000 - $50,000 (Complex projects)',
    'enterprise': '$50,000+ (Enterprise solutions)'
  };
  return labels[budget] || budget;
}