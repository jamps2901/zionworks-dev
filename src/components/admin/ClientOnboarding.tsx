import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ArrowLeft, Building, User, Target, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onComplete: () => void;
}

interface OnboardingData {
  projectType: string;
  projectDescription: string;
  timeline: string;
  budgetRange: string;
  goals: string;
}

const steps = [
  {
    id: 1,
    title: "Welcome to ZionWorks!",
    description: "Let's get started with setting up your project",
    icon: Building
  },
  {
    id: 2,
    title: "Project Details",
    description: "Tell us about your project",
    icon: Target
  },
  {
    id: 3,
    title: "Timeline & Budget",
    description: "Project scope and expectations",
    icon: Calendar
  },
  {
    id: 4,
    title: "All Set!",
    description: "Welcome to your project dashboard",
    icon: CheckCircle
  }
];

const ClientOnboarding = ({ isOpen, onClose, clientId, clientName, onComplete }: ClientOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    projectType: '',
    projectDescription: '',
    timeline: '',
    budgetRange: '',
    goals: ''
  });
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('complete_client_onboarding', {
        p_client_id: clientId,
        p_project_type: formData.projectType,
        p_project_description: formData.projectDescription,
        p_timeline: formData.timeline,
        p_budget_range: formData.budgetRange
      });

      if (error) throw error;

      // After successful onboarding, create default project stages
      await createDefaultProjectStages();

      // Send welcome email
      await sendWelcomeEmail();

      toast({
        title: "Welcome to ZionWorks!",
        description: "Your project has been set up successfully.",
      });

      setCurrentStep(4);
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDefaultProjectStages = async () => {
    try {
      // Get the newly created project using RPC to bypass RLS
      const { data: projects } = await supabase.rpc('get_client_projects', {
        p_client_id: clientId
      });

      if (!projects || projects.length === 0) return;

      const projectId = projects[0].id;

      // Create default project stages via RPC (server-side)
      await supabase.rpc('create_default_project_stages', {
        p_project_id: projectId
      });

    } catch (error) {
      console.error('Error creating default stages:', error);
    }
  };

  const sendWelcomeEmail = async () => {
    try {
      // Get client data for the email
      const { data: clientData } = await supabase
        .from('client_users')
        .select('contact_name, email, company_name')
        .eq('id', clientId)
        .single();

      if (!clientData) return;

      await supabase.functions.invoke('send-client-welcome', {
        body: {
          clientName: clientData.contact_name,
          clientEmail: clientData.email,
          companyName: clientData.company_name,
          projectType: formData.projectType,
          projectDescription: formData.projectDescription,
          loginUrl: `${window.location.origin}/client-portal`
        }
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't fail the onboarding if email fails
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Building className="w-10 h-10 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Welcome, {clientName}!</h3>
              <p className="text-muted-foreground">
                We're excited to work with you. Let's set up your project in just a few steps.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Project Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectType">What type of project is this?</Label>
                <Select value={formData.projectType} onValueChange={(value) => setFormData({...formData, projectType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website Development</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="web-app">Web Application</SelectItem>
                    <SelectItem value="ecommerce">E-commerce Store</SelectItem>
                    <SelectItem value="branding">Branding & Design</SelectItem>
                    <SelectItem value="ai-automation">AI & Automation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projectDescription">Describe your project</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({...formData, projectDescription: e.target.value})}
                  placeholder="Tell us about your vision, goals, and any specific requirements..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="goals">What are your main goals?</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder="e.g., Increase sales, improve customer experience, automate processes..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Timeline & Budget</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="timeline">When do you need this completed?</Label>
                <Select value={formData.timeline} onValueChange={(value) => setFormData({...formData, timeline: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (Rush job)</SelectItem>
                    <SelectItem value="1-month">Within 1 month</SelectItem>
                    <SelectItem value="2-3-months">2-3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="6-months-plus">6+ months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budgetRange">What's your budget range?</Label>
                <Select value={formData.budgetRange} onValueChange={(value) => setFormData({...formData, budgetRange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-5k">Under $5,000</SelectItem>
                    <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-plus">$50,000+</SelectItem>
                    <SelectItem value="discuss">Let's discuss</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold mb-2">All Set!</h3>
              <p className="text-muted-foreground">
                Your project has been created successfully. You'll now have access to your project dashboard, 
                timeline, team communications, and file sharing.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 2:
        return formData.projectType && formData.projectDescription;
      case 3:
        return formData.timeline && formData.budgetRange;
      default:
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">Project Setup</DialogTitle>
          <DialogDescription className="sr-only">
            Complete the project setup wizard to get started with your project
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-px mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[300px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep <= 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : currentStep === 3 ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => { onComplete(); onClose(); }}>
              Enter Dashboard
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientOnboarding;