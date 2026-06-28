import { useState, useEffect } from 'react';
import { Globe, Smartphone, GraduationCap, Hammer, Building2, Users, X, Check, Star, Zap as ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: number;
  title: string;
  description: string;
  icon_url: string;
  category: string;
  price: string;
  created_at: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Default services as fallback
  const defaultServices = [
    {
      id: 1,
      title: "Tradie & Small Business Sites",
      description: "A clean, mobile-first website that gets you found and gets the phone ringing. Real photos, contact form, Google Maps, and your brand colours — done for you in about two weeks.",
      icon_url: "",
      category: "Most Popular",
      price: "From $950",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Online Presence Setup",
      description: "Get found everywhere customers look. Google Business Profile, Facebook and Instagram set up properly, a starter content pack, and a 1-on-1 walkthrough so you can run it yourself.",
      icon_url: "",
      category: "Quick Win",
      price: "From $350",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: "Website Development",
      description: "From a polished brochure site to a full e-commerce store. Fast, responsive, SEO-ready, and built to turn visitors into paying customers — not just look pretty.",
      icon_url: "",
      category: "Development",
      price: "From $2,500",
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: "AI Automation & Custom Software",
      description: "Booking systems, CRMs, inventory tools, and AI workflows that save you hours every week. The same stack I used to build BarterMuse — tailored to how your business actually runs.",
      icon_url: "",
      category: "Development",
      price: "From $5,000",
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: "Mobile Apps",
      description: "Native iOS and Android, or cross-platform builds that reach your customers wherever they are. Push notifications, offline support, and store submission handled end to end.",
      icon_url: "",
      category: "Development",
      price: "From $8,000",
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: "Coding Tutorials & Mentorship",
      description: "One-on-one or small-group lessons for anyone learning to code or build websites — youth, students, or adults upskilling. Online or in-person around King Country.",
      icon_url: "",
      category: "Education",
      price: "From $45/session",
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    console.log('Dialog state changed:', { dialogOpen, selectedService: selectedService?.title });
  }, [dialogOpen, selectedService]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching services:', error);
        // Use default services as fallback
        setServices(defaultServices);
        return;
      }
      
      // If no services in database, use default services
      if (!data || data.length === 0) {
        setServices(defaultServices);
      } else {
        setServices(data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (title: string, category: string) => {
    // Map service titles/categories to appropriate icons
    if (title.toLowerCase().includes('website') || title.toLowerCase().includes('web')) {
      return <Globe className="w-8 h-8" />;
    }
    if (title.toLowerCase().includes('mobile') || title.toLowerCase().includes('app')) {
      return <Smartphone className="w-8 h-8" />;
    }
    if (title.toLowerCase().includes('tutorial') || title.toLowerCase().includes('mentor') || category.toLowerCase().includes('education')) {
      return <GraduationCap className="w-8 h-8" />;
    }
    if (title.toLowerCase().includes('tradie') || title.toLowerCase().includes('retail') || category.toLowerCase().includes('packages')) {
      return <Hammer className="w-8 h-8" />;
    }
    if (title.toLowerCase().includes('social') || title.toLowerCase().includes('presence') || category.toLowerCase().includes('marketing')) {
      return <Users className="w-8 h-8" />;
    }
    // Default to Building2 for custom software and other services
    return <Building2 className="w-8 h-8" />;
  };

  const getServiceFeatures = (title: string, category: string) => {
    // Generate appropriate features based on service type
    if (title.toLowerCase().includes('website') || title.toLowerCase().includes('web')) {
      return ["Responsive Design", "SEO Optimized", "Fast Loading", "CMS Integration"];
    }
    if (title.toLowerCase().includes('mobile') || title.toLowerCase().includes('app')) {
      return ["Cross-Platform", "Push Notifications", "Offline Support", "App Store Ready"];
    }
    if (title.toLowerCase().includes('tutorial') || title.toLowerCase().includes('mentor')) {
      return ["Beginner-Friendly", "Web, Flutter, Python", "Online or In-Person", "Includes Q&A and feedback"];
    }
    if (title.toLowerCase().includes('tradie') || title.toLowerCase().includes('retail')) {
      return ["Mobile-Friendly", "Free Domain + Hosting (1 year)", "Contact Form + Google Maps", "Logo & Brand Colors Included"];
    }
    if (title.toLowerCase().includes('social') || title.toLowerCase().includes('presence')) {
      return ["Google Business Profile Setup", "Facebook & Instagram Page Branding", "Starter Content Pack", "1-on-1 Training Included (Zoom or Local)"];
    }
    if (title.toLowerCase().includes('custom') || title.toLowerCase().includes('software')) {
      return ["Custom Development", "Database Design", "API Integration", "Cloud Deployment"];
    }
    // Default features
    return ["Professional Service", "Quality Guaranteed", "Expert Support", "Timely Delivery"];
  };

  const getDetailedFeatures = (title: string, category: string) => {
    // Generate detailed features for the modal
    if (title.toLowerCase().includes('website') || title.toLowerCase().includes('web')) {
      return [
        "Mobile-responsive design that works on all devices",
        "Search engine optimization (SEO) to improve visibility",
        "Fast loading speeds for better user experience",
        "Content management system for easy updates",
        "Contact forms and business information",
        "Social media integration",
        "Google Analytics setup",
        "SSL certificate for security",
        "Cross-browser compatibility",
        "Professional hosting setup"
      ];
    }
    if (title.toLowerCase().includes('mobile') || title.toLowerCase().includes('app')) {
      return [
        "Native iOS and Android development",
        "Cross-platform solutions with React Native or Flutter",
        "Push notification system",
        "Offline functionality support",
        "App Store and Google Play submission",
        "User authentication and profiles",
        "In-app purchases integration",
        "API integrations with external services",
        "Analytics and crash reporting",
        "Ongoing maintenance and updates"
      ];
    }
    if (title.toLowerCase().includes('tutorial') || title.toLowerCase().includes('mentor')) {
      return [
        "Beginner-friendly approach for all skill levels",
        "Web development (HTML, CSS, JavaScript, React)",
        "Mobile app development (Flutter, React Native)",
        "Python programming fundamentals",
        "One-on-one or small group sessions",
        "Online sessions via Zoom or in-person (King Country)",
        "Real project-based learning",
        "Q&A support between sessions",
        "Progress tracking and feedback",
        "Certificate of completion available"
      ];
    }
    if (title.toLowerCase().includes('tradie') || title.toLowerCase().includes('retail')) {
      return [
        "Mobile-friendly responsive design",
        "Free domain name for 1 year",
        "Free hosting for 1 year",
        "Professional business email setup",
        "Contact form with Google Maps integration",
        "Photo gallery for your work/products",
        "Logo design and brand colors",
        "Basic SEO optimization",
        "Social media links integration",
        "Training on how to update content"
      ];
    }
    if (title.toLowerCase().includes('social') || title.toLowerCase().includes('presence')) {
      return [
        "Google Business Profile creation and optimization",
        "Facebook business page setup and branding",
        "Instagram business account setup",
        "Professional cover photos and profile images",
        "Starter content pack (5-10 posts)",
        "Business information consistency across platforms",
        "Review management setup",
        "1-on-1 training session (Zoom or local)",
        "Social media best practices guide",
        "Ongoing support for first month"
      ];
    }
    if (title.toLowerCase().includes('custom') || title.toLowerCase().includes('software')) {
      return [
        "Custom software development tailored to your needs",
        "Database design and architecture",
        "User interface and experience design",
        "API development and third-party integrations",
        "Cloud deployment on AWS, Azure, or Google Cloud",
        "User authentication and role management",
        "Automated reporting and analytics",
        "Data backup and security measures",
        "Ongoing maintenance and support",
        "Staff training and documentation"
      ];
    }
    // Default features
    return [
      "Professional consultation to understand your needs",
      "Quality guaranteed with testing and review process",
      "Expert technical support throughout the project",
      "Timely delivery according to agreed timeline",
      "Post-launch support and maintenance options",
      "Training provided for managing your solution"
    ];
  };

  const getServiceTimeline = (title: string) => {
    if (title.toLowerCase().includes('website') || title.toLowerCase().includes('web')) {
      return "2-4 weeks";
    }
    if (title.toLowerCase().includes('mobile') || title.toLowerCase().includes('app')) {
      return "6-12 weeks";
    }
    if (title.toLowerCase().includes('tutorial') || title.toLowerCase().includes('mentor')) {
      return "Ongoing sessions";
    }
    if (title.toLowerCase().includes('tradie') || title.toLowerCase().includes('retail')) {
      return "1-2 weeks";
    }
    if (title.toLowerCase().includes('social') || title.toLowerCase().includes('presence')) {
      return "3-5 days";
    }
    if (title.toLowerCase().includes('custom') || title.toLowerCase().includes('software')) {
      return "4-16 weeks";
    }
    return "2-6 weeks";
  };

  const openServiceModal = (service: Service) => {
    console.log('Opening modal for service:', service.title);
    console.log('Dialog open state before:', dialogOpen);
    setSelectedService(service);
    setDialogOpen(true);
    console.log('Selected service set to:', service);
  };

  if (loading) {
    return (
      <section id="services" className="py-24 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-24 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Services Built for <span className="text-gradient">Kiwi Businesses</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From farms to retail shops, from startups to established businesses — 
            we've got the digital solutions to help you grow in the modern marketplace.
          </p>
        </div>

        {/* BarterMuse proof bar */}
        <div className="flex items-center justify-center gap-3 mb-10 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 max-w-2xl mx-auto">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse flex-shrink-0" />
          <p className="text-sm text-center text-muted-foreground">
            <strong className="text-foreground">Live proof:</strong>{' '}
            <a
              href="https://shop.bartermuse.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline underline-offset-2 hover:text-secondary/80 transition-colors"
            >
              BarterMuse
            </a>{' '}
            — an AI-powered local trade platform — was built on this same stack, from Piopio, between hive checks.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => {
            const features = getServiceFeatures(service.title, service.category);
            const isMostPopular = service.category === 'Most Popular';
            const isQuickWin = service.category === 'Quick Win';
            return (
              <div key={service.id} className={`card-feature group relative ${isMostPopular ? 'ring-2 ring-secondary/60' : ''}`}>
                {(isMostPopular || isQuickWin) && (
                  <div className="absolute -top-3 left-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isMostPopular
                        ? 'bg-secondary text-primary'
                        : 'bg-accent/80 text-primary'
                    }`}>
                      {isMostPopular ? <Star className="w-3 h-3" /> : <ZapIcon className="w-3 h-3" />}
                      {service.category}
                    </span>
                  </div>
                )}
                <div className="flex items-center mb-6 mt-2">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-secondary rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-primary">
                      {service.icon_url ? (
                        <img src={service.icon_url} alt={service.title} className="w-8 h-8" />
                      ) : (
                        getServiceIcon(service.title, service.category)
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{service.title}</h3>
                    <div className="text-lg font-semibold text-secondary">{service.price}</div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="btn-outline w-full"
                  onClick={() => {
                    console.log('Button clicked for service:', service.title);
                    openServiceModal(service);
                  }}
                >
                  Learn More
                </Button>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Not sure which service is right for you?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="btn-secondary"
              onClick={() => {
                document.getElementById('quote-wizard')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }}
            >
              Start Our Quiz
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                document.getElementById('booking')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }}
            >
              Book Free Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl">
                    <div className="text-primary">
                      {selectedService.icon_url ? (
                        <img src={selectedService.icon_url} alt={selectedService.title} className="w-6 h-6" />
                      ) : (
                        getServiceIcon(selectedService.title, selectedService.category)
                      )}
                    </div>
                  </div>
                  {selectedService.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Service details for {selectedService.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Price and Timeline */}
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {selectedService.price}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Timeline: {getServiceTimeline(selectedService.title)}
                  </Badge>
                  {selectedService.category && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {selectedService.category}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-3">About This Service</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>

                {/* Detailed Features */}
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-3">What's Included</h4>
                  <div className="grid gap-2">
                    {getDetailedFeatures(selectedService.title, selectedService.category).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                  <Button 
                    className="btn-secondary flex-1"
                    onClick={() => {
                      setDialogOpen(false);
                      setTimeout(() => {
                        document.getElementById('quote-wizard')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start' 
                        });
                      }, 300);
                    }}
                  >
                    Get Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setDialogOpen(false);
                      setTimeout(() => {
                        document.getElementById('booking')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start' 
                        });
                      }, 300);
                    }}
                  >
                    Book Consultation
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Services;