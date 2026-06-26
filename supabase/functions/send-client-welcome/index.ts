import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientWelcomeRequest {
  clientEmail: string;
  clientName: string;
  companyName: string;
  projectType: string;
  projectDescription: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientEmail, clientName, companyName, projectType, projectDescription, loginUrl }: ClientWelcomeRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "ZionWorks Team <onboarding@resend.dev>",
      to: [clientEmail],
      subject: `Welcome to ZionWorks - Your ${projectType} Project is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to ZionWorks!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your project portal is now ready</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 18px; margin-top: 0;">Hi ${clientName},</p>
            
            <p>Thank you for choosing ZionWorks for your <strong>${projectType}</strong> project with ${companyName}!</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="margin-top: 0; color: #0ea5e9;">📋 Your Project</h3>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${projectType}</p>
              <p style="margin: 5px 0;"><strong>Description:</strong> ${projectDescription}</p>
            </div>
            
            <p>Your dedicated project portal is now live with these features:</p>
            <ul style="padding-left: 20px; color: #334155;">
              <li>📊 Real-time progress tracking with 5 project stages</li>
              <li>👥 Direct communication with your project team</li>
              <li>📁 Document upload, review, and approval system</li>
              <li>🔔 Instant notifications for project updates</li>
              <li>📈 Timeline view with milestones and deadlines</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Access Your Project Portal
              </a>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="margin-top: 0; color: #1d4ed8;">What Happens Next?</h4>
              <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Log into your portal using the credentials above</li>
                <li>Review your project timeline and initial requirements</li>
                <li>Upload any additional project materials or requirements</li>
                <li>Meet your dedicated project team</li>
                <li>Track progress as we move through each project stage</li>
              </ol>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p><strong>Questions or need help?</strong></p>
              <p>Contact your project manager or email us at <a href="mailto:hello@zionworks.com" style="color: #2563eb;">hello@zionworks.com</a></p>
              <p>Phone: <a href="tel:+1234567890" style="color: #2563eb;">+1 (234) 567-8900</a></p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Welcome to the ZionWorks family! We're excited to bring your vision to life.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Client welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-client-welcome function:", error);
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