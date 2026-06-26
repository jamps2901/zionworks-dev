import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientCredentialsRequest {
  email: string;
  clientName: string;
  companyName: string;
  temporaryPassword: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, clientName, companyName, temporaryPassword, loginUrl }: ClientCredentialsRequest = await req.json();

    // Validate required fields
    if (!email || !clientName || !companyName || !temporaryPassword || !loginUrl) {
      console.error("Missing required fields:", { email: !!email, clientName: !!clientName, companyName: !!companyName, temporaryPassword: !!temporaryPassword, loginUrl: !!loginUrl });
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate other fields are non-empty strings
    if (typeof clientName !== 'string' || clientName.trim() === '') {
      console.error("Invalid clientName:", clientName);
      return new Response(JSON.stringify({ error: "Invalid client name" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (typeof companyName !== 'string' || companyName.trim() === '') {
      console.error("Invalid companyName:", companyName);
      return new Response(JSON.stringify({ error: "Invalid company name" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (typeof temporaryPassword !== 'string' || temporaryPassword.trim() === '') {
      console.error("Invalid temporaryPassword");
      return new Response(JSON.stringify({ error: "Invalid temporary password" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sending credentials email to:", email, "for company:", companyName);

    const emailResponse = await resend.emails.send({
      from: "ZionWorks Team <onboarding@resend.dev>",
      to: [email],
      subject: `Welcome to ZionWorks - Your Account is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to ZionWorks!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your client account has been created</p>
          </div>
          
          <div style="padding: 30px; background: white; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 18px; margin-top: 0;">Hi ${clientName},</p>
            
            <p>Your ZionWorks client account for <strong>${companyName}</strong> is now active!</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="margin-top: 0; color: #0ea5e9;">🔐 Your Login Credentials</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e0f2fe; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-family: monospace; display: inline-block;">${temporaryPassword}</code></p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;"><strong>⚠️ Security Notice:</strong> Please change your password after your first login for security.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Login to Your Portal
              </a>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="margin-top: 0; color: #1d4ed8;">What's Next?</h4>
              <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li>Click the button above to access your portal</li>
                <li>Log in using the credentials provided above</li>
                <li>Complete your project onboarding questionnaire</li>
                <li>Meet your dedicated project team</li>
                <li>Start collaborating on your project</li>
              </ol>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p><strong>Questions or need help?</strong></p>
              <p>Contact us at <a href="mailto:hello@zionworks.com" style="color: #2563eb;">hello@zionworks.com</a></p>
              <p>Phone: <a href="tel:+1234567890" style="color: #2563eb;">+1 (234) 567-8900</a></p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Welcome to the ZionWorks family! We're excited to work with you.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Client credentials email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-client-credentials function:", error);
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
