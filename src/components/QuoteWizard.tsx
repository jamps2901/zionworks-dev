import { useState } from 'react';
import { ArrowRight, ArrowLeft, Upload, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QuoteWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    projectType: '',
    platform: '',
    timeline: '',
    budget: '',
    name: '',
    email: '',
    phone: '',
    description: '',
    files: null as FileList | null
  });

  const projectTypes = [
    { id: 'website', title: 'Website', description: 'Business website, e-commerce, or landing page' },
    { id: 'app', title: 'Mobile App', description: 'iOS, Android, or cross-platform app' },
    { id: 'ai', title: 'AI Solution', description: 'Chatbots, automation, or AI integration' },
    { id: 'custom', title: 'Custom Software', description: 'CRM, booking system, or bespoke solution' }
  ];

  const platforms = [
    { id: 'web', title: 'Web Only' },
    { id: 'mobile', title: 'Mobile Only' },
    { id: 'both', title: 'Web + Mobile' },
    { id: 'other', title: 'Other Platform' }
  ];

  const timelines = [
    { id: 'urgent', title: '2-4 weeks', subtitle: 'Rush job (+20%)' },
    { id: 'standard', title: '1-2 months', subtitle: 'Standard timeline' },
    { id: 'flexible', title: '3+ months', subtitle: 'We can work around your schedule' }
  ];

  const budgets = [
    { id: 'small', title: '$2,000 - $5,000', subtitle: 'Starter projects' },
    { id: 'medium', title: '$5,000 - $15,000', subtitle: 'Most popular' },
    { id: 'large', title: '$15,000 - $50,000', subtitle: 'Complex projects' },
    { id: 'enterprise', title: '$50,000+', subtitle: 'Enterprise solutions' }
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-quote', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          projectType: formData.projectType,
          platform: formData.platform,
          timeline: formData.timeline,
          budget: formData.budget,
          description: formData.description,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Quote Submitted! 🎉",
        description: "Thank you! We'll get back to you within 24 hours with a detailed quote."
      });

      // Reset form and go back to step 1
      setFormData({
        projectType: '',
        platform: '',
        timeline: '',
        budget: '',
        name: '',
        email: '',
        phone: '',
        description: '',
        files: null
      });
      setCurrentStep(1);

    } catch (error) {
      console.error('Quote submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Sorry, there was an error submitting your quote. Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="quote-wizard" className="py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Let's Build Your <span className="text-gradient">Big Idea</span>
          </h2>
          <p className="text-xl text-primary-foreground/80">
            Tell us about your project and get a detailed quote in minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-secondary text-primary' 
                    : 'bg-primary-foreground/20 text-primary-foreground/50'
                }`}>
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 ${
                    step < currentStep ? 'bg-secondary' : 'bg-primary-foreground/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-3xl p-8 shadow-elegant">
          {/* Step 1: Project Type */}
          {currentStep === 1 && (
            <div className="opacity-100 translate-y-0 transition-all duration-300">
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                What do you want to build?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({...formData, projectType: type.id})}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.projectType === type.id
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <h4 className="font-semibold text-primary mb-2">{type.title}</h4>
                    <p className="text-muted-foreground">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Platform */}
          {currentStep === 2 && (
            <div className="opacity-100 translate-y-0 transition-all duration-300">
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                Which platform(s)?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setFormData({...formData, platform: platform.id})}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      formData.platform === platform.id
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <h4 className="font-semibold text-primary">{platform.title}</h4>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {currentStep === 3 && (
            <div className="opacity-100 translate-y-0 transition-all duration-300">
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                When do you need it?
              </h3>
              <div className="space-y-4">
                {timelines.map((timeline) => (
                  <button
                    key={timeline.id}
                    onClick={() => setFormData({...formData, timeline: timeline.id})}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.timeline === timeline.id
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-primary">{timeline.title}</h4>
                        <p className="text-muted-foreground">{timeline.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {currentStep === 4 && (
            <div className="opacity-100 translate-y-0 transition-all duration-300">
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                What's your budget range?
              </h3>
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <button
                    key={budget.id}
                    onClick={() => setFormData({...formData, budget: budget.id})}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.budget === budget.id
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-primary">{budget.title}</h4>
                        <p className="text-muted-foreground">{budget.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Contact Details */}
          {currentStep === 5 && (
            <div className="opacity-100 translate-y-0 transition-all duration-300">
              <h3 className="text-2xl font-bold text-primary mb-6 text-center">
                Let's get in touch
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Your Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Smith"
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
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+64 21 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Project Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell us more about your project, goals, and any specific requirements..."
                    className="min-h-[120px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Attach Files (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFormData({...formData, files: e.target.files})}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-primary font-medium">Upload files</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Images, PDFs, or documents
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={currentStep === 1 ? 'invisible' : ''}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.projectType) ||
                  (currentStep === 2 && !formData.platform) ||
                  (currentStep === 3 && !formData.timeline) ||
                  (currentStep === 4 && !formData.budget)
                }
                className="btn-secondary"
              >
                Next
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email || isSubmitting}
                className="btn-hero"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Get My Quote
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteWizard;