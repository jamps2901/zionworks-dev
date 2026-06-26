import { useState } from 'react';
import { Calendar, Clock, Phone, Video, MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BookingSystem = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    method: '',
    date: '',
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Generate available time slots for the next 30 days
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Available times: 9 AM - 5 PM in 1-hour slots
      for (let hour = 9; hour <= 17; hour++) {
        slots.push({
          datetime: `${dateStr} ${hour.toString().padStart(2, '0')}:00`,
          display: `${date.toLocaleDateString('en-NZ', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })} at ${hour === 12 ? '12' : hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`
        });
      }
    }
    
    return slots.slice(0, 20); // Show first 20 available slots
  };

  const timeSlots = generateTimeSlots();

  const methods = [
    { 
      id: 'video', 
      title: 'Video Call', 
      description: 'Zoom, Teams, or Google Meet',
      icon: <Video className="w-5 h-5" />
    },
    { 
      id: 'phone', 
      title: 'Phone Call', 
      description: 'We\'ll call you at your number',
      icon: <Phone className="w-5 h-5" />
    },
    { 
      id: 'in-person', 
      title: 'In-Person', 
      description: 'Meet at our King Country office',
      icon: <MapPin className="w-5 h-5" />
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.method || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time for the preferred_time field
      const preferredTime = `${formData.date} ${formData.time}:00`;

      const { data, error } = await supabase.functions.invoke('submit-booking', {
        body: {
          name: formData.name,
          email: formData.email,
          method: formData.method,
          preferredTime: preferredTime,
          notes: formData.notes,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Consultation Booked! 📅",
        description: "Your consultation has been confirmed. Check your email for details and calendar invite."
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        method: '',
        date: '',
        time: '',
        notes: ''
      });

    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Booking Failed",
        description: "Sorry, there was an error booking your consultation. Please try again or call us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-24 bg-gradient-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Book Your <span className="text-gradient">Free Consultation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Let's discuss your project in detail. No obligation, no pressure - just a friendly chat about how we can help bring your ideas to life.
          </p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-elegant">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Your Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@business.co.nz"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Meeting Method */}
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">How would you like to meet?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setFormData({...formData, method: method.id})}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.method === method.id
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className="text-secondary mr-2">
                        {method.icon}
                      </div>
                      <h4 className="font-semibold text-primary">{method.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time Selection */}
            <div>
              <h3 className="text-xl font-semibold text-primary mb-4">When works best for you?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Preferred Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Preferred Time *
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  >
                    <option value="">Select a time</option>
                    {Array.from({ length: 9 }, (_, i) => i + 9).map(hour => (
                      <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {hour === 12 ? '12' : hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'PM' : 'AM'} - {hour + 1 === 13 ? '1' : hour + 1 > 12 ? hour - 11 : hour + 1}{hour + 1 >= 12 ? 'PM' : 'AM'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                📅 Available Monday-Friday, 9 AM - 5 PM (NZST)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Additional Notes (Optional)
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Tell us about your project, any specific questions, or special requirements..."
                className="min-h-[100px]"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-hero text-lg px-8 py-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Booking Consultation...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 w-5 h-5" />
                    Book Free Consultation
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* What to Expect */}
          <div className="mt-8 pt-8 border-t border-border">
            <h4 className="text-lg font-semibold text-primary mb-4">What to expect in your consultation:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Project Discussion</p>
                  <p className="text-sm text-muted-foreground">We'll dive deep into your goals and requirements</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Expert Recommendations</p>
                  <p className="text-sm text-muted-foreground">Get tailored advice based on your business needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Timeline & Budget</p>
                  <p className="text-sm text-muted-foreground">Realistic estimates for your project</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Next Steps</p>
                  <p className="text-sm text-muted-foreground">Clear roadmap to get your project started</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSystem;