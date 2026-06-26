import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Github, Calendar, ArrowRight, X, Users, Clock, Target, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Import project screenshots
import ecommerceImg from '@/assets/portfolio-ecommerce.webp';
import farmAppImg from '@/assets/portfolio-farm-app.webp';
import electricianImg from '@/assets/portfolio-electrician.webp';
import restaurantImg from '@/assets/portfolio-restaurant.webp';
import aiChatbotImg from '@/assets/portfolio-ai-chatbot.webp';
import realEstateImg from '@/assets/portfolio-realestate.webp';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  completedDate: string;
  detailedInfo: {
    overview: string;
    challenge: string;
    solution: string;
    results: string[];
    features: string[];
    timeline: string;
    teamSize: string;
    clientType: string;
  };
}

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Portfolio projects data with real case studies
  const projects: Project[] = [
    {
      id: 1,
      title: "King Country Electrical Services",
      description: "Modern website redesign for local electrician featuring online booking, service calculator, and customer portal. Transformed their digital presence from zero to hero.",
      image: electricianImg,
      category: "Local Business",
      technologies: ["React", "TypeScript", "Supabase", "Stripe"],
      completedDate: "2024-01-15",
      detailedInfo: {
        overview: "Complete digital transformation for Mike Thompson's electrical business in Te Kuiti. From a basic Facebook page to a comprehensive business platform that drives bookings.",
        challenge: "Mike was losing customers to Hamilton-based electricians with professional websites. He relied entirely on word-of-mouth and struggled with scheduling conflicts from phone-only bookings.",
        solution: "We built a modern, SEO-optimized website with integrated booking system, service calculator for instant quotes, customer portal for job tracking, and automated email sequences for follow-ups.",
        results: [
          "300% increase in online bookings within 3 months",
          "Reduced phone call volume by 60% through self-service options",
          "Expanded service area to Hamilton and Cambridge",
          "Average job value increased by 25% through professional presentation"
        ],
        features: [
          "Real-time booking calendar with SMS confirmations",
          "Service calculator for instant electrical quotes",
          "Customer portal for job progress tracking",
          "Local SEO optimization for King Country searches",
          "Mobile-responsive design for on-site access",
          "Automated email marketing for customer retention"
        ],
        timeline: "8 weeks",
        teamSize: "2 developers + 1 SEO specialist",
        clientType: "Local Tradesperson"
      }
    },
    {
      id: 2,
      title: "Te Kuiti Farm Supply E-commerce",
      description: "Complete e-commerce transformation for agricultural supplies with inventory sync, delivery tracking, and farmer account system. Doubled revenue in first year.",
      image: farmAppImg,
      category: "E-commerce",
      technologies: ["Next.js", "PostgreSQL", "Stripe", "SendGrid"],
      completedDate: "2023-11-22",
      detailedInfo: {
        overview: "Sarah Mitchell's farm supply store needed to compete with online agricultural retailers. We built a comprehensive e-commerce platform that serves farmers across the greater Waikato region.",
        challenge: "Local farmers were ordering supplies online from Auckland-based competitors instead of supporting the local business. The store had great products but no online presence for ordering.",
        solution: "Custom e-commerce platform with farmer-specific features: bulk ordering, seasonal product recommendations, delivery route optimization, and integrated inventory management with their existing POS system.",
        results: [
          "200% revenue growth in first 12 months",
          "Reduced order processing time by 75%",
          "Expanded customer base to include Rotorua and Taupo farmers",
          "Inventory turnover improved by 40% through better demand forecasting"
        ],
        features: [
          "Bulk ordering system with quantity discounts",
          "Seasonal product recommendations based on farming calendar",
          "Delivery route optimization for rural areas",
          "Farmer account system with credit terms",
          "Integration with existing MYOB inventory system",
          "Mobile app for on-farm ordering"
        ],
        timeline: "14 weeks",
        teamSize: "3 developers + 1 agricultural consultant",
        clientType: "Agricultural Retailer"
      }
    },
    {
      id: 3,
      title: "Hamilton Property Group",
      description: "Premium real estate platform with virtual tours, property management dashboard, and automated client communication. Increased sales velocity by 60%.",
      image: realEstateImg,
      category: "Real Estate",
      technologies: ["React", "Node.js", "MongoDB", "Mapbox"],
      completedDate: "2023-12-08",
      detailedInfo: {
        overview: "David Chen's property group needed to differentiate themselves in Hamilton's competitive real estate market. We created a premium digital experience that positions them as the tech-forward choice.",
        challenge: "Competing against established agencies with larger marketing budgets. Needed to showcase properties more effectively and provide better service to both buyers and sellers in the Hamilton market.",
        solution: "Comprehensive real estate platform with virtual tour integration, advanced property search with Mapbox integration, automated valuation tools, and client portal for transparent communication throughout the sales process.",
        results: [
          "60% faster property sales through better lead qualification",
          "80% more qualified leads from improved online presence",
          "Expanded market share in Hamilton East and Hillcrest areas",
          "Client satisfaction score improved to 4.9/5 stars"
        ],
        features: [
          "Interactive property maps with neighborhood insights",
          "Virtual tour integration with 360-degree photography",
          "Automated property valuation using local market data",
          "Client portal with real-time sales progress tracking",
          "Lead scoring system for prioritizing follow-ups",
          "Mobile-optimized property browsing experience"
        ],
        timeline: "12 weeks",
        teamSize: "2 full-stack developers + 1 UX designer",
        clientType: "Real Estate Agency"
      }
    },
    {
      id: 4,
      title: "Otorohanga Restaurant Chain",
      description: "Multi-location restaurant management system with online ordering, kitchen display systems, and customer loyalty program. Streamlined operations across 3 locations.",
      image: restaurantImg,
      category: "Hospitality",
      technologies: ["Vue.js", "Express", "PostgreSQL", "Redis"],
      completedDate: "2023-10-12",
      detailedInfo: {
        overview: "Lisa Wang's restaurant group needed to unify operations across their three locations in Otorohanga, Te Kuiti, and Hamilton. We built an integrated system that treats all locations as one cohesive business.",
        challenge: "Managing three separate restaurant locations with different systems was causing operational headaches. Online ordering was handled by expensive third-party apps that charged high commissions.",
        solution: "Unified restaurant management platform with centralized ordering, kitchen display systems for each location, integrated POS, customer loyalty program, and real-time analytics dashboard for all locations.",
        results: [
          "45% increase in online orders across all locations",
          "25% improvement in kitchen efficiency through digital ordering",
          "Eliminated third-party delivery app fees (saving $40k annually)",
          "Customer loyalty program drove 35% repeat business increase"
        ],
        features: [
          "Multi-location online ordering with pickup/delivery options",
          "Kitchen display systems with order prioritization",
          "Unified customer database across all locations",
          "Loyalty program with points and rewards",
          "Real-time analytics dashboard for all locations",
          "Staff scheduling and performance tracking"
        ],
        timeline: "16 weeks",
        teamSize: "4 developers + 1 hospitality consultant",
        clientType: "Multi-location Restaurant Group"
      }
    },
    {
      id: 5,
      title: "Waitomo Tourism AI Assistant",
      description: "Intelligent chatbot system for tourism operator handling 24/7 customer inquiries, booking modifications, and personalized cave tour recommendations.",
      image: aiChatbotImg,
      category: "AI Solution",
      technologies: ["OpenAI", "Python", "FastAPI", "React"],
      completedDate: "2024-02-28",
      detailedInfo: {
        overview: "Mark Stevens' tourism operation at Waitomo Caves needed 24/7 customer support to handle international visitors in different time zones. We built an AI assistant that handles complex tourism inquiries intelligently.",
        challenge: "International tourists expect instant responses for booking inquiries and tour information, but the small team couldn't provide 24/7 support. Many potential bookings were lost due to delayed responses.",
        solution: "AI-powered customer service system trained specifically on Waitomo tourism data, integrated with booking systems, capable of handling complex multi-tour itineraries and weather-dependent activity recommendations.",
        results: [
          "90% reduction in after-hours missed inquiries",
          "70% improvement in customer satisfaction scores",
          "30% increase in multi-tour bookings through intelligent upselling",
          "Saved equivalent of 2 full-time customer service positions"
        ],
        features: [
          "Natural language processing for tourism inquiries",
          "Real-time integration with booking calendar",
          "Weather-aware activity recommendations",
          "Multi-language support for international visitors",
          "Intelligent escalation to human agents",
          "Booking modification and cancellation handling"
        ],
        timeline: "10 weeks",
        teamSize: "2 AI specialists + 1 tourism industry expert",
        clientType: "Tourism Operator"
      }
    },
    {
      id: 6,
      title: "Taumarunui Trading Co.",
      description: "Modern e-commerce rebuild for established local retail business with integrated POS, inventory sync, and customer analytics dashboard. 150% online revenue growth.",
      image: ecommerceImg,
      category: "Retail",
      technologies: ["Shopify Plus", "React", "GraphQL", "Klaviyo"],
      completedDate: "2023-09-15",
      detailedInfo: {
        overview: "Jenny Taylor's family business needed to bridge the gap between their established physical store and the digital marketplace. We created a unified retail experience that honors their 40-year local legacy.",
        challenge: "Fourth-generation family business was losing younger customers to online shopping. Their website hadn't been updated in years and wasn't integrated with their physical store operations.",
        solution: "Complete digital transformation with modern e-commerce platform that syncs with in-store inventory, unified customer profiles across channels, and email marketing automation that drives both online and in-store sales.",
        results: [
          "150% online revenue growth in first 6 months",
          "30% improvement in inventory turnover through better demand visibility",
          "Reduced stock-outs by 60% through integrated inventory management",
          "25% of online customers now also visit the physical store"
        ],
        features: [
          "Real-time inventory sync between online and physical store",
          "Unified customer profiles for omnichannel experience",
          "Click-and-collect system for online orders",
          "Email marketing automation with local event integration",
          "Customer analytics dashboard for buying pattern insights",
          "Mobile-optimized shopping experience"
        ],
        timeline: "12 weeks",
        teamSize: "2 e-commerce specialists + 1 retail consultant",
        clientType: "Local Retail Business"
      }
    }
  ];

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-primary mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our <span className="text-gradient">Portfolio</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Real projects for real Kiwi businesses. See how we've helped our clients 
            grow their digital presence and streamline their operations.
          </motion.p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-secondary text-primary shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-secondary/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category === 'all' ? 'All Projects' : category}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="card-feature group h-full">
                {/* Project Image */}
                <div className="relative overflow-hidden rounded-t-xl bg-gradient-subtle aspect-video">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </CardHeader>

                  {/* Technologies */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-primary mb-2">Technologies:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Completed Date */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Completed: {new Date(project.completedDate).toLocaleDateString('en-NZ')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="btn-secondary flex-1"
                      onClick={() => setSelectedProject(project)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    {project.githubUrl && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(project.githubUrl, '_blank')}
                      >
                        <Github className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Project Detail Modal */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProject && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <DialogTitle className="text-2xl mb-2">{selectedProject.title}</DialogTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Completed: {new Date(selectedProject.completedDate).toLocaleDateString('en-NZ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedProject.detailedInfo.teamSize}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedProject.detailedInfo.timeline}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{selectedProject.category}</Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Project Image */}
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overview */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Project Overview
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProject.detailedInfo.overview}
                    </p>
                  </div>

                  {/* Challenge & Solution Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">The Challenge</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {selectedProject.detailedInfo.challenge}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Our Solution</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {selectedProject.detailedInfo.solution}
                      </p>
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Key Results
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedProject.detailedInfo.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-secondary/10 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {selectedProject.detailedInfo.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-primary">Client Type</p>
                        <p className="text-muted-foreground">{selectedProject.detailedInfo.clientType}</p>
                      </div>
                      <div>
                        <p className="font-medium text-primary">Timeline</p>
                        <p className="text-muted-foreground">{selectedProject.detailedInfo.timeline}</p>
                      </div>
                      <div>
                        <p className="font-medium text-primary">Team Size</p>
                        <p className="text-muted-foreground">{selectedProject.detailedInfo.teamSize}</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="bg-gradient-subtle p-6 rounded-lg text-center">
                    <h4 className="text-lg font-semibold text-primary mb-2">
                      Need a Similar Solution?
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      Let's discuss how we can create something amazing for your business too.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedProject(null);
                          document.getElementById('quote-wizard')?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start' 
                          });
                        }}
                      >
                        Get a Quote
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(null);
                          document.getElementById('contact')?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start' 
                          });
                        }}
                      >
                        Let's Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-primary mb-4">
            Ready to Start Your Project?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every great project starts with a conversation. Let's discuss your ideas 
            and see how we can bring them to life.
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
              Start Our Project Quiz
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }}
            >
              Get In Touch
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;