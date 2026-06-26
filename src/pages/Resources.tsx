import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SEOHead } from '@/components/SEOHead';
import { 
  Download, 
  FileText, 
  Video, 
  CheckSquare, 
  Search,
  BookOpen,
  Lightbulb,
  BarChart3,
  Users,
  Smartphone,
  Globe,
  MessageSquare,
  Star,
  Clock,
  ArrowRight,
  Home,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources = [
    // Digital Marketing Guides
    {
      id: 1,
      title: "Complete Digital Marketing Strategy Guide",
      description: "Step-by-step framework for creating effective digital marketing campaigns that convert",
      category: "guides",
      type: "PDF Guide",
      downloadUrl: "#",
      size: "2.1 MB",
      pages: 35,
      readTime: "15 min",
      icon: BarChart3,
      tags: ["Strategy", "Marketing", "ROI"],
      featured: true
    },
    {
      id: 2,
      title: "Social Media Content Calendar Template",
      description: "Plan and schedule your social media content for maximum engagement",
      category: "templates",
      type: "Excel Template",
      downloadUrl: "#",
      size: "156 KB",
      readTime: "5 min",
      icon: MessageSquare,
      tags: ["Social Media", "Content", "Planning"]
    },
    {
      id: 3,
      title: "Website Performance Optimization Checklist",
      description: "25-point checklist to improve your website speed and user experience",
      category: "checklists",
      type: "PDF Checklist",
      downloadUrl: "#",
      size: "890 KB",
      pages: 8,
      readTime: "10 min",
      icon: CheckSquare,
      tags: ["Performance", "SEO", "UX"]
    },
    {
      id: 4,
      title: "Local SEO Masterclass for New Zealand Businesses",
      description: "Video course covering local SEO strategies specific to the NZ market",
      category: "courses",
      type: "Video Course",
      downloadUrl: "#",
      duration: "45 min",
      readTime: "45 min",
      icon: Video,
      tags: ["SEO", "Local Business", "New Zealand"],
      featured: true
    },
    {
      id: 5,
      title: "Email Marketing Campaign Templates",
      description: "Ready-to-use email templates for different industries and occasions",
      category: "templates",
      type: "HTML Templates",
      downloadUrl: "#",
      size: "3.2 MB",
      readTime: "8 min",
      icon: FileText,
      tags: ["Email Marketing", "Templates", "Conversion"]
    },
    {
      id: 6,
      title: "Mobile-First Design Principles",
      description: "Essential guidelines for creating mobile-optimized websites that convert",
      category: "guides",
      type: "PDF Guide",
      downloadUrl: "#",
      size: "1.8 MB",
      pages: 28,
      readTime: "12 min",
      icon: Smartphone,
      tags: ["Mobile Design", "UX", "Conversion"]
    },
    {
      id: 7,
      title: "Brand Identity Development Worksheet",
      description: "Interactive worksheet to define your brand voice, values, and visual identity",
      category: "templates",
      type: "PDF Worksheet",
      downloadUrl: "#",
      size: "1.1 MB",
      pages: 12,
      readTime: "20 min",
      icon: Lightbulb,
      tags: ["Branding", "Identity", "Strategy"]
    },
    {
      id: 8,
      title: "Analytics Setup and Tracking Guide",
      description: "Complete guide to setting up Google Analytics and tracking key metrics",
      category: "guides",
      type: "PDF Guide",
      downloadUrl: "#",
      size: "2.5 MB",
      pages: 42,
      readTime: "18 min",
      icon: BarChart3,
      tags: ["Analytics", "Tracking", "Metrics"],
      featured: true
    }
  ];

  const categories = [
    { id: 'all', label: 'All Resources', icon: Globe },
    { id: 'guides', label: 'Digital Marketing Guides', icon: BookOpen },
    { id: 'templates', label: 'Templates & Tools', icon: FileText },
    { id: 'checklists', label: 'Checklists', icon: CheckSquare },
    { id: 'courses', label: 'Video Courses', icon: Video }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResources = resources.filter(resource => resource.featured);

  return (
    <>
      <SEOHead
        title="Free Digital Marketing Resources & Templates | ZionWorks"
        description="Download free digital marketing guides, templates, checklists, and tools. Expert resources for New Zealand businesses to grow online."
        keywords="digital marketing resources, templates, guides, SEO checklists, marketing tools, New Zealand business"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              
              <div className="flex items-center gap-4">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Main Website
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent mb-6">
                Digital Marketing Resources
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Free guides, templates, and tools to help your business thrive online. 
                Created specifically for New Zealand businesses by digital marketing experts.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-md mx-auto mb-12"
            >
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Featured Resources</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {featuredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <resource.icon className="h-8 w-8 text-primary mb-2" />
                          <Badge variant="secondary">Featured</Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {resource.title}
                        </CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {resource.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {resource.readTime}
                          </span>
                        </div>
                        <Button className="w-full group">
                          <Download className="w-4 h-4 mr-2" />
                          Download Free
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Resources Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 text-xs lg:text-sm"
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <resource.icon className="h-8 w-8 text-primary mb-2" />
                          {resource.featured && (
                            <Badge variant="secondary">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {resource.title}
                        </CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {resource.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {resource.readTime}
                          </span>
                          {resource.size && (
                            <span>Size: {resource.size}</span>
                          )}
                          {resource.pages && (
                            <span>{resource.pages} pages</span>
                          )}
                          {resource.duration && (
                            <span>{resource.duration} video</span>
                          )}
                        </div>
                        <Button className="w-full group">
                          <Download className="w-4 h-4 mr-2" />
                          Download Free
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or category filter.
                  </p>
                </div>
              )}
            </Tabs>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Get New Resources First</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Be the first to know when we release new guides, templates, and tools. 
                Plus get exclusive business tips delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input placeholder="Enter your email" className="flex-1" />
                <Button>
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Resources;