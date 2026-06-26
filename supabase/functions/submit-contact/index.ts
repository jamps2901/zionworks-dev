import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  message: string;
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

    const contactData: ContactSubmission = await req.json();
    
    console.log("Received contact submission:", contactData);

    // Save to database
    const { data: contact, error: dbError } = await supabaseClient
      .from("contacts")
      .insert([
        {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || null,
          message: contactData.message,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log("Contact saved to database:", contact);

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">Thanks for reaching out!</h1>
        <p>Hi ${contactData.name},</p>
        <p>We've received your message and appreciate you taking the time to contact us!</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Your Message</h3>
          <p style="background: white; padding: 15px; border-radius: 6px; border-left: 3px solid #2563eb;">
            "${contactData.message}"
          </p>
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>We'll review your message within 24 hours</li>
          <li>You'll hear back from our team via email or phone</li>
          <li>We can schedule a free consultation if needed</li>
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
      to: [contactData.email],
      subject: "Thanks for your message - We'll be in touch soon!",
      html: customerEmailHtml,
    });

    if (customerEmailError) {
      console.error("Customer email error:", customerEmailError);
      // Don't throw here - contact is saved, just log the error
    }

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">📞 New Contact Message!</h1>
        <p>You have a new contact message from your website:</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
          ${contactData.phone ? `<p><strong>Phone:</strong> <a href="tel:${contactData.phone}">${contactData.phone}</a></p>` : ''}
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Message</h3>
          <p style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${contactData.message}</p>
        </div>
        
        <p style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <strong>Action Required:</strong> Respond within 24 hours to maintain excellent customer service!
        </p>
      </div>
    `;

    const { error: adminEmailError } = await resend.emails.send({
      from: "Zion Works <onboarding@resend.dev>",
      to: ["jrpatnugot29@gmail.com"],
      subject: `📞 New Contact Message from ${contactData.name}`,
      html: adminEmailHtml,
    });

    if (adminEmailError) {
      console.error("Admin email error:", adminEmailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Message sent successfully!",
        contactId: contact.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in submit-contact function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send message", 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});