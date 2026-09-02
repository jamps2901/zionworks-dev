import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, ArrowRight, Users, Clock, Target, Sparkles } from 'lucide-react';
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
  isLive: boolean;
  detailedInfo: {
    overview: string;
    approach: string;
    capabilities: string[];
    features: string[];
    timeline: string;
    clientType: string;
  };
}

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // One real, live product (BarterMuse), plus concept builds showing range of capability.
  // None of the concept entries are past clients -- they're honest demonstrations of
  // what gets built for each type of business, not fabricated case studies.
  const projects: Project[] = [
    {
      id: 1,
      title: "BarterMuse",
      description: "A real, live AI-powered local trade platform -- built end to end on this same stack. Not a demo: it's shipped, running, and actually used.",
      image: aiChatbotImg,
      category: "Live Product",
      technologies: ["React", "TypeScript", "Supabase", "AI"],
      liveUrl: "https://shop.bartermuse.app",
      isLive: true,
      detailedInfo: {
        overview: "BarterMuse is a local barter and trade platform with AI-powered value guidance, local match radar, and a full trade workspace -- built solo, from Piopio, between hive checks. It's the clearest proof of what this stack can actually ship.",
        approach: "Full-stack build from concept to live product: AI valuation logic, matching system, and a real transactional workspace, deployed and running today.",
        capabilities: [
          "AI-assisted value estimation for trade items",
          "Local match discovery between traders",
          "A working trade negotiation workspace",
          "Live, deployed, and publicly accessible right now"
        ],
        features: [
          "AI value guidance engine",
          "Local Trade Intelligence matching",
          "Real-time trade workspace",
          "Built and shipped by one person"
        ],
        timeline: "Live product",
        clientType: "Original Product"
      }
    },
    {
      id: 2,
      title: "Tradie & Local Service Sites",
      description: "The kind of site a sparky, plumber, or builder actually needs: booking, a service calculator, and a way to look credible against Hamilton-based competitors.",
      image: electricianImg,
      category: "Concept Build",
      technologies: ["React", "TypeScript", "Supabase"],
      isLive: false,
      detailedInfo: {
        overview: "A concept build showing what a modern trade business site looks like -- built to demonstrate the kind of Tradie & Small Business package listed under Services, not a real past client.",
        approach: "Mobile-first design, a booking flow that replaces phone-tag, and an instant service calculator so a quote doesn't require a callback.",
        capabilities: [
          "Real-time booking calendar",
          "Instant service/quote calculator",
          "Mobile-first layout for on-site use",
          "Local SEO structure"
        ],
        features: [
          "Booking calendar with confirmations",
          "Service calculator",
          "Customer job-progress view",
          "Mobile-responsive design"
        ],
        timeline: "~2 weeks typical",
        clientType: "Concept -- Trade & Local Service"
      }
    },
    {
      id: 3,
      title: "Farm & Rural Supply E-commerce",
      description: "An online ordering concept for a rural supply business -- built to show how a local retailer competes with big-city online competitors without losing the personal relationship.",
      image: farmAppImg,
      category: "Concept Build",
      technologies: ["React", "Supabase", "Stripe"],
      isLive: false,
      detailedInfo: {
        overview: "A concept build exploring what a farm/rural supply store's online ordering system could look like -- not a real past client, but the kind of build available under AI Automation & Custom Software.",
        approach: "Bulk ordering, seasonal recommendations, and delivery-route thinking built for how rural buyers actually order.",
        capabilities: [
          "Bulk ordering with quantity pricing",
          "Seasonal product suggestions",
          "Delivery-area aware ordering",
          "Account-based repeat ordering"
        ],
        features: [
          "Bulk ordering flow",
          "Seasonal recommendation logic",
          "Farmer account system",
          "Mobile ordering"
        ],
        timeline: "~10-14 weeks typical",
        clientType: "Concept -- Rural Retail"
      }
    },
    {
      id: 4,
      title: "Property & Real Estate Platform",
      description: "A concept for a real estate presence built to compete on experience, not just listings -- virtual tours, an interactive map, and a client-facing sales tracker.",
      image: realEstateImg,
      category: "Concept Build",
      technologies: ["React", "Node.js", "Mapbox"],
      isLive: false,
      detailedInfo: {
        overview: "A concept build demonstrating a premium real estate platform -- shown as an example of the Website Development package, not a real past client.",
        approach: "Interactive property maps, virtual tour integration, and a transparent client portal so buyers and sellers aren't left guessing.",
        capabilities: [
          "Interactive property maps",
          "Virtual tour integration",
          "Automated valuation tooling",
          "Client-facing sales tracker"
        ],
        features: [
          "Neighbourhood-aware map search",
          "360-degree tour support",
          "Sales progress portal",
          "Mobile browsing experience"
        ],
        timeline: "~8-12 weeks typical",
        clientType: "Concept -- Real Estate"
      }
    },
    {
      id: 5,
      title: "Multi-Location Hospitality System",
      description: "A concept for a small hospitality group juggling multiple locations -- unified ordering, kitchen display, and loyalty, without the cut third-party delivery apps take.",
      image: restaurantImg,
      category: "Concept Build",
      technologies: ["React", "Supabase", "Stripe"],
      isLive: false,
      detailedInfo: {
        overview: "A concept build showing how a small multi-location hospitality business could unify operations under one system -- not a real past client, an example of what AI Automation & Custom Software covers.",
        approach: "Centralised ordering and kitchen display across locations, with a loyalty system that avoids ongoing third-party delivery fees.",
        capabilities: [
          "Multi-location online ordering",
          "Kitchen display integration",
          "Unified customer loyalty",
          "No per-order third-party fees"
        ],
        features: [
          "Pickup/delivery ordering",
          "Kitchen display prioritisation",
          "Loyalty points system",
          "Cross-location dashboard"
        ],
        timeline: "~12-16 weeks typical",
        clientType: "Concept -- Hospitality"
      }
    },
    {
      id: 6,
      title: "AI Customer Assistant Concept",
      description: "A concept AI assistant for a tourism or service operator needing after-hours coverage -- the same category of tool now offered as a monthly bolt-on for any existing site.",
      image: ecommerceImg,
      category: "Concept Build",
      technologies: ["OpenAI", "Supabase", "React"],
      isLive: false,
      detailedInfo: {
        overview: "A concept build showing an AI assistant handling customer inquiries after-hours -- the same underlying capability now available as the AI Widget add-on for businesses that already have a website.",
        approach: "An AI assistant trained on a business's own services and FAQs, available 24/7, with a clean handoff to a human when it's out of its depth.",
        capabilities: [
          "24/7 automated first response",
          "Business-specific knowledge",
          "Booking-aware conversation",
          "Escalation to a real person when needed"
        ],
        features: [
          "Natural-language chat",
          "Booking-calendar awareness",
          "Multi-topic handling",
          "Human escalation path"
        ],
        timeline: "~1-2 weeks to add to an existing site",
        clientType: "Concept -- AI Add-On"
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
            What I Can <span className="text-gradient">Build</span>
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            BarterMuse is a real, live product I built and shipped. Everything else here
            is an honest concept build showing the kind of work available under Services --
            not past clients, just proof of what's possible.
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
              <Card className={`card-feature group h-full ${project.isLive ? 'ring-2 ring-secondary/60' : ''}`}>
                {/* Project Image */}
                <div className="relative overflow-hidden rounded-t-xl bg-gradient-subtle aspect-video">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className={project.isLive ? 'gap-1' : ''}>
                      {project.isLive && <Sparkles className="w-3 h-3" />}
                      {project.category}
                    </Badge>
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

                  {/* Status line */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground flex items-center">
                      {project.isLive ? (
                        <>
                          <Sparkles className="w-3 h-3 mr-1 text-secondary" />
                          Live product -- try it yourself
                        </>
                      ) : (
                        <>
                          <Target className="w-3 h-3 mr-1" />
                          Concept build, not a past client
                        </>
                      )}
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
                    {project.liveUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(project.liveUrl, '_blank', 'noopener,noreferrer')}
                      >
                        Visit
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
                          <Clock className="w-4 h-4" />
                          {selectedProject.detailedInfo.timeline}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedProject.detailedInfo.clientType}
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
                      Overview
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProject.detailedInfo.overview}
                    </p>
                  </div>

                  {/* Approach */}
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Approach</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {selectedProject.detailedInfo.approach}
                    </p>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3">
                      {selectedProject.isLive ? 'What It Does' : 'What This Demonstrates'}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedProject.detailedInfo.capabilities.map((capability, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-secondary/10 rounded-lg">
                          <Sparkles className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{capability}</span>
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

                  {/* CTA */}
                  <div className="bg-gradient-subtle p-6 rounded-lg text-center">
                    <h4 className="text-lg font-semibold text-primary mb-2">
                      Want Something Like This?
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      Let's talk about what you actually need -- no obligation.
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
