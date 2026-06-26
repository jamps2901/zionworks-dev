import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  type: string;
  company_name: string;
  contact_name: string;
  email: string;
  project_type: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, company_name, contact_name, email, project_type }: AdminNotificationRequest = await req.json();

    if (type === 'new_client_intake') {
      const emailResponse = await resend.emails.send({
        from: "ZionWorks Admin <onboarding@resend.dev>",
        to: ["jrpatnugot29@gmail.com"], // Admin email
        subject: `New Client Intake Request - ${company_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">New Client Intake Request</h1>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #334155;">Client Details</h2>
              <p><strong>Company:</strong> ${company_name}</p>
              <p><strong>Contact:</strong> ${contact_name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Project Type:</strong> ${project_type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1d4ed8;">
                <strong>Action Required:</strong> Please review this request in the admin panel and approve to create the client account.
              </p>
            </div>
            
            <div style="margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/admin" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review in Admin Panel
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="color: #64748b; font-size: 14px;">
              This is an automated notification from ZionWorks client intake system.
            </p>
          </div>
        `,
      });

      console.log("Admin notification sent successfully:", emailResponse);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);