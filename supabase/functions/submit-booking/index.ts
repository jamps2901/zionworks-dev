import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface BookingSubmission {
  name: string;
  email: string;
  method: string;
  preferredTime: string;
  notes?: string;
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

    const bookingData: BookingSubmission = await req.json();
    
    console.log("Received booking submission:", bookingData);

    // Save to database
    const { data: booking, error: dbError } = await supabaseClient
      .from("bookings")
      .insert([
        {
          name: bookingData.name,
          email: bookingData.email,
          method: bookingData.method,
          preferred_time: bookingData.preferredTime,
          notes: bookingData.notes || null,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log("Booking saved to database:", booking);

    // Format date for emails
    const bookingDate = new Date(bookingData.preferredTime);
    const formattedDate = bookingDate.toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = bookingDate.toLocaleTimeString('en-NZ', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Create calendar event string for .ics file
    const startTime = bookingDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endTime = new Date(bookingDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const calendarEvent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Zion Works//Calendar//EN
BEGIN:VEVENT
UID:${booking.id}@zionworks.co.nz
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:Consultation with Zion Works - ${bookingData.name}
DESCRIPTION:Free consultation call with Zion Works.\\n\\nClient: ${bookingData.name}\\nEmail: ${bookingData.email}\\nMethod: ${bookingData.method}${bookingData.notes ? `\\nNotes: ${bookingData.notes}` : ''}
LOCATION:${bookingData.method === 'phone' ? 'Phone Call' : bookingData.method === 'video' ? 'Video Call (Zoom/Teams)' : 'Zion Works Office, King Country, NZ'}
ORGANIZER:CN=Zion Works:MAILTO:hello@zionworks.co.nz
ATTENDEE:CN=${bookingData.name}:MAILTO:${bookingData.email}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">Consultation Booked! 📅</h1>
        <p>Hi ${bookingData.name},</p>
        <p>Great news! Your consultation with Zion Works has been confirmed.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #2563eb;">
          <h3 style="color: #374151; margin-top: 0;">📅 Booking Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Method:</strong> ${getMethodLabel(bookingData.method)}</p>
          ${bookingData.notes ? `<p><strong>Notes:</strong> ${bookingData.notes}</p>` : ''}
        </div>
        
        <p><strong>What to expect:</strong></p>
        <ul>
          <li>We'll discuss your project requirements and goals</li>
          <li>Get answers to all your questions about our services</li>
          <li>Receive recommendations tailored to your business</li>
          <li>Get a ballpark estimate for your project</li>
        </ul>
        
        <p><strong>Before our call:</strong></p>
        <ul>
          <li>Think about your project goals and objectives</li>
          <li>Prepare any questions you'd like to ask</li>
          <li>Have examples of websites/apps you like ready</li>
        </ul>
        
        <p>Need to reschedule? Simply reply to this email or call us at <a href="tel:+64271234567">+64 27 123 4567</a></p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280;">Looking forward to speaking with you!</p>
          <p style="color: #6b7280;"><strong>Zion Works Team</strong><br>King Country, Waikato, New Zealand</p>
        </div>
      </div>
    `;

    const { error: customerEmailError } = await resend.emails.send({
      from: "Zion Works <onboarding@resend.dev>",
      to: [bookingData.email],
      subject: `Consultation Confirmed - ${formattedDate} at ${formattedTime}`,
      html: customerEmailHtml,
      attachments: [
        {
          filename: 'consultation.ics',
          content: btoa(calendarEvent),
          content_type: 'text/calendar'
        }
      ]
    });

    if (customerEmailError) {
      console.error("Customer email error:", customerEmailError);
    }

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">📅 New Consultation Booking!</h1>
        <p>You have a new consultation booking:</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #374151; margin-top: 0;">Client Information</h3>
          <p><strong>Name:</strong> ${bookingData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${bookingData.email}">${bookingData.email}</a></p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">📅 Booking Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Method:</strong> ${getMethodLabel(bookingData.method)}</p>
          ${bookingData.notes ? `<p><strong>Notes:</strong> ${bookingData.notes}</p>` : ''}
        </div>
        
        <p style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <strong>Action Required:</strong> Add this appointment to your calendar and prepare for the consultation!
        </p>
      </div>
    `;

    const { error: adminEmailError } = await resend.emails.send({
      from: "Zion Works <onboarding@resend.dev>",
      to: ["jrpatnugot29@gmail.com"],
      subject: `📅 New Consultation: ${bookingData.name} - ${formattedDate}`,
      html: adminEmailHtml,
      attachments: [
        {
          filename: 'consultation.ics',
          content: btoa(calendarEvent),
          content_type: 'text/calendar'
        }
      ]
    });

    if (adminEmailError) {
      console.error("Admin email error:", adminEmailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Consultation booked successfully!",
        bookingId: booking.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in submit-booking function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to book consultation", 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper function to get readable method labels
function getMethodLabel(method: string): string {
  const labels = {
    'phone': 'Phone Call',
    'video': 'Video Call (Zoom/Teams)',
    'in-person': 'In-Person Meeting',
  };
  return labels[method] || method;
}