import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

// Import blog post images
import websiteFeaturesImg from '@/assets/blog-website-features.webp';
import aiBusinessImg from '@/assets/blog-ai-business.webp';
import mobileDesignImg from '@/assets/blog-mobile-design.webp';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
}

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showFullPost, setShowFullPost] = useState(false);

  // Blog posts data with full, detailed content
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "5 Essential Website Features Every Kiwi Business Needs in 2024",
      excerpt: "Discover the must-have features that will help your New Zealand business succeed online, from mobile optimization to local SEO strategies that actually work.",
      content: `
        <div class="blog-intro">
          <p class="lead">In today's digital landscape, having a strong online presence is crucial for New Zealand businesses. Whether you're a small farm in King Country, a growing retail business in Hamilton, or a tradie serving the Waikato region, your website often serves as the first—and sometimes only—point of contact with potential customers.</p>
          
          <p>After working with over 50 Kiwi businesses across various industries, we've identified five essential features that separate successful business websites from those that struggle to convert visitors into customers.</p>
        </div>
        
        <h3>🔥 1. Mobile-First Design (Non-Negotiable)</h3>
        <div class="feature-section">
          <p><strong>Why it matters:</strong> With over 65% of New Zealanders using their phones to browse the internet, your website must work flawlessly on mobile devices. This isn't just about responsive design—it's about creating an experience that's actually <em>better</em> on mobile than desktop.</p>
          
          <h4>What Mobile-First Really Means:</h4>
          <ul class="detailed-list">
            <li><strong>Touch-friendly navigation:</strong> Buttons at least 44px in size, easily tappable with thumbs</li>
            <li><strong>Readable text:</strong> Minimum 16px font size without zooming required</li>
            <li><strong>Fast loading:</strong> Under 3 seconds on 3G networks</li>
            <li><strong>Thumb-friendly design:</strong> Important elements within easy reach of thumbs</li>
            <li><strong>No horizontal scrolling:</strong> Content fits perfectly in portrait mode</li>
          </ul>
          
          <div class="case-study">
            <h4>📊 Real Results:</h4>
            <p>One of our clients, a King Country agricultural supply company, saw their mobile bounce rate drop from 78% to 32% after implementing mobile-first design. Mobile sales increased by 240% within three months.</p>
          </div>
        </div>
        
        <h3>🎯 2. Local SEO Optimization for New Zealand</h3>
        <div class="feature-section">
          <p><strong>Why it's crucial:</strong> Local search is everything for New Zealand businesses. When someone searches for "electrician near me" or "café in Hamilton," you want to appear in those results—not your competitors.</p>
          
          <h4>Essential Local SEO Elements:</h4>
          <ul class="detailed-list">
            <li><strong>Google My Business optimization:</strong> Complete profile with photos, hours, and regular updates</li>
            <li><strong>Local keyword integration:</strong> Include your city, region, and surrounding areas naturally in your content</li>
            <li><strong>NAP consistency:</strong> Name, Address, Phone number must be identical across all online platforms</li>
            <li><strong>Local content creation:</strong> Blog about local events, partnerships, and community involvement</li>
            <li><strong>Customer review management:</strong> Actively encourage and respond to reviews</li>
            <li><strong>Local schema markup:</strong> Help Google understand your business location and services</li>
          </ul>
          
          <div class="pro-tip">
            <h4>💡 Pro Tip for King Country Businesses:</h4>
            <p>Include specific location pages for each town you serve. A page for "Plumbing Services in Otorohanga" will rank better than generic service pages when people search for local help.</p>
          </div>
        </div>
        
        <h3>⚡ 3. Lightning-Fast Loading Speeds</h3>
        <div class="feature-section">
          <p><strong>The hard truth:</strong> New Zealanders expect websites to load quickly, especially on mobile networks. A delay of just 3 seconds can cause 40% of visitors to abandon your site. In rural areas with slower internet, this is even more critical.</p>
          
          <h4>Speed Optimization Strategies:</h4>
          <ul class="detailed-list">
            <li><strong>Image optimization:</strong> Use WebP format, compress without losing quality, implement lazy loading</li>
            <li><strong>Efficient hosting:</strong> Choose NZ-based hosting providers for faster local access</li>
            <li><strong>Minimal code:</strong> Remove unnecessary plugins, minify CSS and JavaScript</li>
            <li><strong>Content Delivery Network (CDN):</strong> Serve content from servers closest to your users</li>
            <li><strong>Browser caching:</strong> Store files locally so repeat visitors load pages instantly</li>
          </ul>
          
          <div class="benchmark">
            <h4>🎯 Target Benchmarks:</h4>
            <ul>
              <li>Desktop: Under 2 seconds</li>
              <li>Mobile: Under 3 seconds</li>
              <li>Google PageSpeed score: 90+ for mobile</li>
            </ul>
          </div>
        </div>
        
        <h3>📞 4. Crystal Clear Contact Information & CTAs</h3>
        <div class="feature-section">
          <p><strong>Don't make customers hunt for your contact details.</strong> Your contact information should be visible and accessible from every page, with clear calls-to-action that guide visitors toward becoming customers.</p>
          
          <h4>Contact Optimization Checklist:</h4>
          <ul class="detailed-list">
            <li><strong>Click-to-call phone numbers:</strong> Especially important for mobile users</li>
            <li><strong>Contact forms that work:</strong> Test them regularly and respond quickly</li>
            <li><strong>Business hours prominently displayed:</strong> Include holiday hours and emergency contact info</li>
            <li><strong>Google Maps integration:</strong> Make it easy for customers to find you</li>
            <li><strong>Multiple contact methods:</strong> Phone, email, contact form, and social media</li>
            <li><strong>Response time expectations:</strong> Tell customers when they can expect to hear back</li>
          </ul>
          
          <div class="cta-examples">
            <h4>🎯 Effective CTA Examples for Different Industries:</h4>
            <ul>
              <li><strong>Trades:</strong> "Get Your Free Quote Today" / "Book Emergency Service"</li>
              <li><strong>Retail:</strong> "Shop Now with Free Delivery" / "Visit Our Store"</li>
              <li><strong>Professional Services:</strong> "Schedule Your Consultation" / "Download Our Guide"</li>
              <li><strong>Restaurants:</strong> "Book Your Table" / "Order Online for Pickup"</li>
            </ul>
          </div>
        </div>
        
        <h3>🔒 5. Security & Trust Signals</h3>
        <div class="feature-section">
          <p><strong>Security isn't optional anymore.</strong> Google now marks websites without SSL certificates as "not secure," which can seriously damage customer trust. Beyond technical security, you need to actively build trust with your visitors.</p>
          
          <h4>Essential Security & Trust Elements:</h4>
          <ul class="detailed-list">
            <li><strong>SSL certificate:</strong> Essential for security and SEO rankings</li>
            <li><strong>Customer testimonials:</strong> Real reviews from actual customers with photos when possible</li>
            <li><strong>Professional team photos:</strong> Show the faces behind your business</li>
            <li><strong>Certifications and awards:</strong> Display relevant industry credentials</li>
            <li><strong>Privacy policy and terms:</strong> Required by law and builds trust</li>
            <li><strong>Business registration details:</strong> Include your company number and physical address</li>
            <li><strong>Recent project showcase:</strong> Show your latest work with before/after photos</li>
          </ul>
          
          <div class="trust-building">
            <h4>🤝 Advanced Trust-Building Strategies:</h4>
            <ul>
              <li>Include local references and landmarks in your content</li>
              <li>Show your involvement in local community events</li>
              <li>Display professional association memberships</li>
              <li>Include insurance and licensing information</li>
              <li>Add a "About Us" story that connects with local values</li>
            </ul>
          </div>
        </div>
        
        <div class="conclusion">
          <h3>🚀 Ready to Implement These Features?</h3>
          <p>These five features form the foundation of a successful business website in New Zealand. While there are many other features you can add, focusing on these essentials first will give you the biggest return on investment.</p>
          
          <div class="action-steps">
            <h4>Your Next Steps:</h4>
            <ol>
              <li><strong>Audit your current website</strong> against these five features</li>
              <li><strong>Prioritize mobile experience</strong> - this is your biggest opportunity</li>
              <li><strong>Optimize for local search</strong> - claim and optimize your Google My Business listing today</li>
              <li><strong>Test your website speed</strong> using Google PageSpeed Insights</li>
              <li><strong>Add trust signals</strong> - start collecting customer testimonials</li>
            </ol>
          </div>
          
          <p><strong>Need help implementing these features?</strong> We specialize in building websites for New Zealand businesses that not only look great but actually drive results. Every website we build includes these five essential features as standard.</p>
        </div>
      `,
      author: "Zion Works Team",
      publishDate: "2024-01-15",
      readTime: "8 min read",
      category: "Web Development",
      tags: ["Business", "Website", "SEO", "New Zealand", "Mobile"],
      image: websiteFeaturesImg
    },
    {
      id: 2,
      title: "AI for Small Business: A Practical Guide for Kiwi Entrepreneurs",
      excerpt: "How small and medium businesses in New Zealand can leverage AI tools to improve efficiency, reduce costs, and provide better customer service—without needing a tech degree.",
      content: `
        <div class="blog-intro">
          <p class="lead">Artificial Intelligence isn't just for tech giants anymore. Small and medium businesses across New Zealand are discovering practical, affordable ways to use AI tools to streamline operations, improve customer service, and grow their businesses—without needing to hire expensive tech specialists.</p>
          
          <p>This guide focuses on <em>practical</em> AI applications that make sense for real New Zealand businesses, with honest cost breakdowns and realistic expectations.</p>
        </div>
        
        <h3>🤖 AI Tools That Actually Make Sense for SMBs</h3>
        
        <div class="ai-tool-section">
          <h4>1. Customer Service Chatbots</h4>
          <p><strong>What it does:</strong> A well-configured chatbot can handle common customer questions 24/7, freeing up your team to focus on complex tasks and actual sales.</p>
          
          <div class="use-cases">
            <h5>Perfect for answering:</h5>
            <ul class="detailed-list">
              <li><strong>Business information:</strong> Hours, location, contact details</li>
              <li><strong>Service areas:</strong> "Do you service Otorohanga?" / "How far do you travel?"</li>
              <li><strong>Basic pricing:</strong> Standard rates for common services</li>
              <li><strong>Availability:</strong> "Can you fit me in this week?"</li>
              <li><strong>Process questions:</strong> "How do I request a quote?" / "What happens next?"</li>
              <li><strong>Emergency contacts:</strong> After-hours numbers and procedures</li>
            </ul>
          </div>
          
          <div class="real-example">
            <h5>📋 Real Example: King Country Electrician</h5>
            <p>Before chatbot: 40+ calls per day asking about service areas and basic pricing.</p>
            <p>After chatbot: 15 calls per day, all qualified leads. Staff time saved: 3 hours daily.</p>
            <p><strong>ROI:</strong> Chatbot cost $150/month, saved $2,400/month in staff time.</p>
          </div>
        </div>
        
        <div class="ai-tool-section">
          <h4>2. Automated Scheduling & Appointment Management</h4>
          <p><strong>What it does:</strong> AI-powered scheduling tools can automatically book appointments, send reminders, handle rescheduling, and even optimize your calendar for maximum efficiency.</p>
          
          <div class="features">
            <h5>Key Features:</h5>
            <ul class="detailed-list">
              <li><strong>24/7 booking:</strong> Customers can book appointments outside business hours</li>
              <li><strong>Automatic reminders:</strong> SMS and email reminders reduce no-shows by 60%</li>
              <li><strong>Conflict resolution:</strong> Automatically suggests alternative times when conflicts arise</li>
              <li><strong>Travel time optimization:</strong> Books appointments considering travel time between locations</li>
              <li><strong>Integration:</strong> Syncs with your existing calendar and CRM systems</li>
            </ul>
          </div>
          
          <div class="industries">
            <h5>🎯 Particularly Valuable For:</h5>
            <ul>
              <li><strong>Healthcare professionals:</strong> Doctors, dentists, physiotherapists</li>
              <li><strong>Beauty and wellness:</strong> Hairdressers, massage therapists, personal trainers</li>
              <li><strong>Professional services:</strong> Accountants, lawyers, consultants</li>
              <li><strong>Home services:</strong> Cleaners, maintenance, garden services</li>
              <li><strong>Trades:</strong> Plumbers, electricians (for non-emergency appointments)</li>
            </ul>
          </div>
        </div>
        
        <div class="ai-tool-section">
          <h4>3. Content Creation & Marketing Assistance</h4>
          <p><strong>Important note:</strong> AI shouldn't replace human creativity, but it can dramatically speed up content creation and help overcome writer's block.</p>
          
          <div class="content-types">
            <h5>What AI Can Help With:</h5>
            <ul class="detailed-list">
              <li><strong>Blog post drafts:</strong> Create outlines and first drafts for your expertise to refine</li>
              <li><strong>Social media captions:</strong> Generate engaging posts for Facebook and Instagram</li>
              <li><strong>Product descriptions:</strong> Create compelling descriptions for e-commerce sites</li>
              <li><strong>Email responses:</strong> Draft responses to common customer inquiries</li>
              <li><strong>Marketing copy:</strong> Headlines, ad copy, and promotional content</li>
              <li><strong>SEO content:</strong> Generate location-specific content for better local search</li>
            </ul>
          </div>
          
          <div class="content-workflow">
            <h5>💡 Recommended Workflow:</h5>
            <ol>
              <li><strong>AI generates first draft</strong> - saves 70% of initial writing time</li>
              <li><strong>Human review and edit</strong> - add personality, local knowledge, and expertise</li>
              <li><strong>Final human approval</strong> - ensure accuracy and brand voice</li>
            </ol>
          </div>
        </div>
        
        <div class="ai-tool-section">
          <h4>4. Inventory & Business Management</h4>
          <p><strong>For retail and service businesses:</strong> AI can predict demand, optimize inventory levels, and even suggest pricing strategies based on local market conditions.</p>
          
          <div class="management-features">
            <h5>Practical Applications:</h5>
            <ul class="detailed-list">
              <li><strong>Demand forecasting:</strong> Predict which products to stock and when</li>
              <li><strong>Price optimization:</strong> Adjust pricing based on demand and competition</li>
              <li><strong>Supplier management:</strong> Automate reordering when stock levels get low</li>
              <li><strong>Customer behavior analysis:</strong> Identify your best customers and their preferences</li>
              <li><strong>Maintenance scheduling:</strong> Predict when equipment needs servicing</li>
            </ul>
          </div>
        </div>
        
        <h3>💰 Real Cost vs. Benefit Analysis</h3>
        <div class="cost-analysis">
          <p>Let's be practical about costs. Here's what AI tools actually cost for small businesses:</p>
          
          <div class="cost-breakdown">
            <h4>Monthly Cost Examples:</h4>
            <ul class="cost-list">
              <li><strong>Basic Chatbot:</strong> $50-150/month (saves 2-5 hours of staff time weekly)</li>
              <li><strong>Scheduling System:</strong> $30-80/month (reduces no-shows by 40-60%)</li>
              <li><strong>Content Creation Tools:</strong> $20-50/month (creates content 5x faster)</li>
              <li><strong>Business Analytics:</strong> $100-300/month (improves decision making)</li>
            </ul>
          </div>
          
          <div class="roi-calculation">
            <h4>📊 ROI Calculation Example:</h4>
            <p><strong>Scenario:</strong> Small business owner earning $50/hour</p>
            <ul>
              <li>Chatbot saves 3 hours/week = $150/week saved</li>
              <li>Chatbot costs $100/month</li>
              <li><strong>Monthly savings:</strong> $600 - $100 = $500 profit</li>
              <li><strong>Annual ROI:</strong> 500% return on investment</li>
            </ul>
          </div>
        </div>
        
        <h3>🚀 Getting Started: Our Step-by-Step Recommendation</h3>
        <div class="getting-started">
          <ol class="step-list">
            <li>
              <strong>Start Small & Specific:</strong> Pick one area where AI could help immediately (usually customer service or scheduling)
            </li>
            <li>
              <strong>Test Before Investing:</strong> Try free or low-cost solutions first. Many tools offer free trials.
            </li>
            <li>
              <strong>Measure Results:</strong> Track time saved, customer satisfaction, and revenue impact
            </li>
            <li>
              <strong>Train Your Team:</strong> Ensure staff know how to use and manage the AI tools
            </li>
            <li>
              <strong>Scale Gradually:</strong> Add more AI tools as you see proven benefits
            </li>
          </ol>
        </div>
        
        <h3>⚠️ Common Mistakes to Avoid</h3>
        <div class="mistakes">
          <ul class="detailed-list">
            <li><strong>Trying to automate everything at once:</strong> Start with one process and perfect it</li>
            <li><strong>Choosing overly complex solutions:</strong> Simple often works better for small businesses</li>
            <li><strong>Not training your team:</strong> Staff need to understand how AI tools work</li>
            <li><strong>Set-and-forget mentality:</strong> AI tools need regular maintenance and updates</li>
            <li><strong>Ignoring customer preferences:</strong> Some customers still prefer human interaction</li>
            <li><strong>Poor data quality:</strong> AI is only as good as the data you feed it</li>
          </ul>
        </div>
        
        <h3>🏆 Success Stories from New Zealand Businesses</h3>
        <div class="success-stories">
          <div class="story">
            <h4>Hamilton Cafe Chain</h4>
            <p><strong>Challenge:</strong> Managing reservations across 3 locations manually</p>
            <p><strong>Solution:</strong> AI-powered booking system with customer preference tracking</p>
            <p><strong>Results:</strong> 300% increase in online reservations, 50% reduction in booking errors</p>
          </div>
          
          <div class="story">
            <h4>Waikato Farm Equipment Supplier</h4>
            <p><strong>Challenge:</strong> Customers calling about part availability after hours</p>
            <p><strong>Solution:</strong> Chatbot integrated with inventory system</p>
            <p><strong>Results:</strong> 24/7 customer service, 40% reduction in phone calls, increased sales</p>
          </div>
        </div>
        
        <div class="conclusion">
          <h3>🎯 The Bottom Line</h3>
          <p>AI for small business isn't about replacing humans—it's about freeing up your time to focus on what you do best: serving customers and growing your business. The key is to start with practical, measurable applications that solve real problems.</p>
          
          <p><strong>Ready to explore AI for your business?</strong> Let's have a conversation about practical AI solutions that make sense for your specific situation and budget. We help New Zealand businesses implement AI tools that actually deliver results.</p>
        </div>
      `,
      author: "Zion Works Team",
      publishDate: "2024-01-08",
      readTime: "12 min read",
      category: "AI & Technology",
      tags: ["AI", "Small Business", "Automation", "Technology", "ROI"],
      image: aiBusinessImg
    },
    {
      id: 3,
      title: "Mobile-First Design: The Complete Guide for New Zealand Businesses",
      excerpt: "With over 65% of web traffic coming from mobile devices, learn why mobile-first design is crucial for business success, complete with local case studies and actionable strategies.",
      content: `
        <div class="blog-intro">
          <p class="lead">If you're still designing websites with desktop users in mind first, you're doing it backwards—and losing customers every day. Mobile-first design isn't just a trend; it's essential for business success in New Zealand, where mobile internet usage has overtaken desktop across all age groups.</p>
          
          <p>This comprehensive guide will show you exactly why mobile-first design matters, how to implement it, and what results you can expect.</p>
        </div>
        
        <h3>📱 The Mobile Reality in New Zealand</h3>
        <div class="stats-section">
          <p>The numbers don't lie. Here's what's happening with mobile usage in New Zealand:</p>
          
          <div class="stats-grid">
            <div class="stat">
              <h4>67%</h4>
              <p>of New Zealanders primarily use mobile devices to browse the internet</p>
            </div>
            <div class="stat">
              <h4>45%</h4>
              <p>of all online sales in NZ now happen on mobile devices</p>
            </div>
            <div class="stat">
              <h4>78%</h4>
              <p>of local business searches happen on mobile</p>
            </div>
            <div class="stat">
              <h4>3 seconds</h4>
              <p>is the maximum loading time before 53% of users abandon a mobile site</p>
            </div>
          </div>
          
          <div class="google-impact">
            <h4>🔍 Google's Mobile-First Indexing</h4>
            <p>Since 2019, Google primarily uses the mobile version of your website for ranking and indexing. This means:</p>
            <ul>
              <li>If your mobile site is poor, your search rankings suffer</li>
              <li>Mobile page speed directly impacts SEO performance</li>
              <li>Mobile user experience affects your Google My Business ranking</li>
            </ul>
          </div>
        </div>
        
        <h3>🎯 What Mobile-First Design Actually Means</h3>
        <div class="definition-section">
          <p>Mobile-first design means designing for mobile screens first, then scaling up to larger screens. It's the opposite of traditional responsive design.</p>
          
          <div class="approach-comparison">
            <div class="old-way">
              <h4>❌ Old Way (Desktop-First):</h4>
              <ol>
                <li>Design for desktop</li>
                <li>Try to squeeze it onto mobile</li>
                <li>Remove features that don't fit</li>
                <li>Wonder why mobile users don't convert</li>
              </ol>
            </div>
            
            <div class="new-way">
              <h4>✅ New Way (Mobile-First):</h4>
              <ol>
                <li>Design for mobile screens first</li>
                <li>Focus on essential features and content</li>
                <li>Enhance for larger screens</li>
                <li>Create a superior mobile experience</li>
              </ol>
            </div>
          </div>
        </div>
        
        <h3>🏗️ Core Mobile-First Design Principles</h3>
        
        <div class="principle">
          <h4>1. Thumb-Friendly Design</h4>
          <p>Design for how people actually use their phones. Most users navigate with their thumbs, especially on larger phones.</p>
          
          <div class="thumb-guidelines">
            <h5>Thumb Zone Guidelines:</h5>
            <ul class="detailed-list">
              <li><strong>Easy reach zone:</strong> Bottom third of screen - place primary actions here</li>
              <li><strong>Okay reach zone:</strong> Middle third - secondary actions and content</li>
              <li><strong>Hard reach zone:</strong> Top third - navigation and less critical elements</li>
              <li><strong>Minimum touch target:</strong> 44px x 44px (Apple) or 48dp (Google)</li>
              <li><strong>Spacing:</strong> At least 8px between touchable elements</li>
            </ul>
          </div>
        </div>
        
        <div class="principle">
          <h4>2. Content Prioritization</h4>
          <p>With limited screen space, every pixel matters. You must prioritize what's most important.</p>
          
          <div class="content-hierarchy">
            <h5>Content Priority Order:</h5>
            <ol>
              <li><strong>Primary action:</strong> What do you most want users to do?</li>
              <li><strong>Key information:</strong> Essential details users need</li>
              <li><strong>Navigation:</strong> How users move through your site</li>
              <li><strong>Supporting content:</strong> Additional helpful information</li>
              <li><strong>Nice-to-have features:</strong> May be hidden behind interaction</li>
            </ol>
          </div>
        </div>
        
        <div class="principle">
          <h4>3. Performance Optimization</h4>
          <p>Mobile users often have slower connections and less powerful devices. Performance isn't optional.</p>
          
          <div class="performance-checklist">
            <h5>Performance Checklist:</h5>
            <ul class="detailed-list">
              <li><strong>Image optimization:</strong> Use WebP format, proper sizing, lazy loading</li>
              <li><strong>Minimal HTTP requests:</strong> Combine files, use CSS sprites</li>
              <li><strong>Critical CSS inline:</strong> Load essential styles first</li>
              <li><strong>Compressed files:</strong> Gzip compression for all text files</li>
              <li><strong>Efficient fonts:</strong> Limit font variants, use system fonts when possible</li>
              <li><strong>Service workers:</strong> Cache important resources for offline use</li>
            </ul>
          </div>
        </div>
        
        <h3>📊 Real Results from New Zealand Businesses</h3>
        
        <div class="case-study detailed">
          <h4>Case Study 1: King Country Farm Supply</h4>
          <div class="case-details">
            <p><strong>Business:</strong> Agricultural equipment and supplies, serving rural Waikato</p>
            <p><strong>Challenge:</strong> High mobile bounce rate, low conversion from mobile users</p>
            
            <h5>Before Mobile-First Redesign:</h5>
            <ul>
              <li>Mobile bounce rate: 78%</li>
              <li>Mobile conversion rate: 1.2%</li>
              <li>Average mobile session: 45 seconds</li>
              <li>Mobile page load time: 8.5 seconds</li>
            </ul>
            
            <h5>Mobile-First Solutions Implemented:</h5>
            <ul class="detailed-list">
              <li><strong>Simplified navigation:</strong> Reduced from 7 main categories to 4</li>
              <li><strong>Product search optimization:</strong> Large search bar with voice input</li>
              <li><strong>One-thumb checkout:</strong> Streamlined 3-step mobile checkout process</li>
              <li><strong>Click-to-call integration:</strong> Prominent phone buttons throughout</li>
              <li><strong>Image optimization:</strong> Reduced image sizes by 70% without quality loss</li>
            </ul>
            
            <h5>Results After 3 Months:</h5>
            <ul class="results">
              <li>Mobile bounce rate: 35% (↓ 55%)</li>
              <li>Mobile conversion rate: 4.1% (↑ 242%)</li>
              <li>Average mobile session: 2 minutes 15 seconds (↑ 200%)</li>
              <li>Mobile page load time: 2.1 seconds (↓ 75%)</li>
              <li>Phone calls from mobile: Increased 200%</li>
              <li>Mobile revenue: Increased 340%</li>
            </ul>
          </div>
        </div>
        
        <div class="case-study detailed">
          <h4>Case Study 2: Hamilton Family Restaurant</h4>
          <div class="case-details">
            <p><strong>Business:</strong> Local family restaurant with takeaway and dine-in</p>
            <p><strong>Challenge:</strong> Customers struggling to view menu and make reservations on mobile</p>
            
            <h5>Mobile-First Solutions:</h5>
            <ul class="detailed-list">
              <li><strong>Thumb-friendly menu:</strong> Large, easy-to-read menu with touch-friendly categories</li>
              <li><strong>One-tap reservations:</strong> Simple booking form with date/time picker</li>
              <li><strong>Order-ahead integration:</strong> Mobile ordering for pickup</li>
              <li><strong>Social proof:</strong> Customer photos and reviews prominently displayed</li>
              <li><strong>Location integration:</strong> One-tap directions and click-to-call</li>
            </ul>
            
            <h5>Results:</h5>
            <ul class="results">
              <li>Online reservations: ↑ 300%</li>
              <li>Mobile orders: ↑ 450%</li>
              <li>Google My Business engagement: ↑ 180%</li>
              <li>Customer satisfaction scores: ↑ 25%</li>
              <li>Repeat customer rate: ↑ 60%</li>
            </ul>
          </div>
        </div>
        
        <h3>🛠️ Mobile-First Implementation Strategies</h3>
        
        <div class="implementation-strategy">
          <h4>Phase 1: Foundation (Week 1-2)</h4>
          <ul class="detailed-list">
            <li><strong>Mobile performance audit:</strong> Test current mobile experience</li>
            <li><strong>User journey mapping:</strong> Identify mobile user goals and pain points</li>
            <li><strong>Content audit:</strong> Determine what's essential vs. nice-to-have</li>
            <li><strong>Competitor analysis:</strong> Research what works in your industry</li>
          </ul>
        </div>
        
        <div class="implementation-strategy">
          <h4>Phase 2: Design & Wireframing (Week 3-4)</h4>
          <ul class="detailed-list">
            <li><strong>Mobile wireframes first:</strong> Design for 320px width initially</li>
            <li><strong>Touch target optimization:</strong> Ensure all buttons are finger-friendly</li>
            <li><strong>Navigation simplification:</strong> Reduce menu complexity</li>
            <li><strong>Form optimization:</strong> Minimize required fields, use appropriate input types</li>
          </ul>
        </div>
        
        <div class="implementation-strategy">
          <h4>Phase 3: Development & Testing (Week 5-8)</h4>
          <ul class="detailed-list">
            <li><strong>Progressive enhancement:</strong> Build mobile version first, enhance for desktop</li>
            <li><strong>Performance optimization:</strong> Optimize images, minimize code</li>
            <li><strong>Real device testing:</strong> Test on actual phones, not just browser tools</li>
            <li><strong>User testing:</strong> Get feedback from real customers using mobile devices</li>
          </ul>
        </div>
        
        <h3>🚨 Common Mobile Design Mistakes (And How to Avoid Them)</h3>
        
        <div class="mistakes-section">
          <div class="mistake">
            <h4>❌ Mistake 1: Tiny Touch Targets</h4>
            <p><strong>Problem:</strong> Buttons too small to tap accurately</p>
            <p><strong>Solution:</strong> Minimum 44px touch targets with 8px spacing</p>
          </div>
          
          <div class="mistake">
            <h4>❌ Mistake 2: Unreadable Text</h4>
            <p><strong>Problem:</strong> Text too small, requiring zoom to read</p>
            <p><strong>Solution:</strong> Minimum 16px font size, high contrast ratios</p>
          </div>
          
          <div class="mistake">
            <h4>❌ Mistake 3: Intrusive Pop-ups</h4>
            <p><strong>Problem:</strong> Pop-ups that are hard to close on mobile</p>
            <p><strong>Solution:</strong> Avoid pop-ups, use inline CTAs instead</p>
          </div>
          
          <div class="mistake">
            <h4>❌ Mistake 4: Horizontal Scrolling</h4>
            <p><strong>Problem:</strong> Content extends beyond screen width</p>
            <p><strong>Solution:</strong> Use flexible layouts, test on narrow screens</p>
          </div>
          
          <div class="mistake">
            <h4>❌ Mistake 5: Auto-Playing Media</h4>
            <p><strong>Problem:</strong> Videos/audio playing automatically</p>
            <p><strong>Solution:</strong> Always require user interaction to play media</p>
          </div>
        </div>
        
        <h3>🧪 Testing Your Mobile Experience</h3>
        
        <div class="testing-guide">
          <h4>Essential Testing Tools:</h4>
          <ul class="detailed-list">
            <li><strong>Google Mobile-Friendly Test:</strong> Basic mobile compatibility check</li>
            <li><strong>Google PageSpeed Insights:</strong> Performance analysis with specific recommendations</li>
            <li><strong>Real Device Testing:</strong> Test on actual phones with different screen sizes</li>
            <li><strong>Network Throttling:</strong> Test on slower 3G connections</li>
            <li><strong>Chrome DevTools:</strong> Mobile device simulation and debugging</li>
            <li><strong>BrowserStack:</strong> Test across multiple devices and browsers</li>
          </ul>
          
          <h4>User Testing Checklist:</h4>
          <ul class="detailed-list">
            <li>Can users complete key tasks with one thumb?</li>
            <li>Is text readable without zooming?</li>
            <li>Do forms work smoothly with mobile keyboards?</li>
            <li>Are touch targets large enough and well-spaced?</li>
            <li>Does the site load quickly on mobile networks?</li>
            <li>Can users easily find contact information?</li>
          </ul>
        </div>
        
        <div class="conclusion">
          <h3>🏆 The Mobile-First Advantage</h3>
          <p>Businesses that embrace mobile-first design don't just improve their mobile experience—they create better websites overall. The constraints of mobile design force you to focus on what's truly important, resulting in cleaner, faster, more effective websites across all devices.</p>
          
          <div class="key-takeaways">
            <h4>Key Takeaways:</h4>
            <ul>
              <li>Mobile-first is no longer optional for New Zealand businesses</li>
              <li>Performance and usability directly impact your bottom line</li>
              <li>Simple, focused design often outperforms complex layouts</li>
              <li>Testing with real users on real devices is essential</li>
              <li>The investment in mobile-first design pays for itself quickly</li>
            </ul>
          </div>
          
          <p><strong>Ready to create a mobile-first experience that converts?</strong> We help New Zealand businesses design and build websites that work beautifully on every device, with mobile performance that drives real results.</p>
        </div>
      `,
      author: "Zion Works Team",
      publishDate: "2023-12-22",
      readTime: "15 min read",
      category: "Design",
      tags: ["Mobile", "Design", "UX", "Responsive", "Performance"],
      image: mobileDesignImg
    }
  ];

  const categories = ['all', ...Array.from(new Set(blogPosts.map(p => p.category)))];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(p => p.category === selectedCategory);

  const openFullPost = (post: BlogPost) => {
    setSelectedPost(post);
    setShowFullPost(true);
  };

  const closeFullPost = () => {
    setShowFullPost(false);
    setSelectedPost(null);
  };

  // If showing full post, render the full post view
  if (showFullPost && selectedPost) {
    return (
      <section id="blog" className="py-24 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="outline" 
              onClick={closeFullPost}
              className="mb-4"
            >
              ← Back to Blog
            </Button>
          </motion.div>

          {/* Article Header */}
          <motion.article 
            className="bg-card rounded-2xl p-8 shadow-elegant"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">{selectedPost.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {selectedPost.title}
              </h1>
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {selectedPost.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedPost.publishDate).toLocaleDateString('en-NZ')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedPost.readTime}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none text-foreground 
                         prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary
                         prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4
                         prose-h4:text-lg prose-h4:font-medium prose-h4:mt-6 prose-h4:mb-3
                         prose-h5:text-base prose-h5:font-medium prose-h5:mt-4 prose-h5:mb-2
                         prose-p:mb-4 prose-p:leading-relaxed
                         prose-ul:my-4 prose-ol:my-4 prose-li:mb-2
                         prose-blockquote:border-l-secondary prose-blockquote:bg-muted/50 prose-blockquote:p-4 prose-blockquote:rounded
                         [&_.blog-intro]:bg-gradient-subtle [&_.blog-intro]:p-6 [&_.blog-intro]:rounded-xl [&_.blog-intro]:mb-8
                         [&_.lead]:text-lg [&_.lead]:font-medium [&_.lead]:text-primary [&_.lead]:mb-4
                         [&_.feature-section]:mb-8 [&_.feature-section]:pb-6 [&_.feature-section]:border-b [&_.feature-section]:border-border
                         [&_.detailed-list]:space-y-2 [&_.detailed-list_li]:flex [&_.detailed-list_li]:items-start
                         [&_.case-study]:bg-muted/30 [&_.case-study]:p-6 [&_.case-study]:rounded-lg [&_.case-study]:my-6
                         [&_.pro-tip]:bg-secondary/10 [&_.pro-tip]:border [&_.pro-tip]:border-secondary/20 [&_.pro-tip]:p-4 [&_.pro-tip]:rounded-lg [&_.pro-tip]:my-4
                         [&_.stats-grid]:grid [&_.stats-grid]:grid-cols-2 [&_.stats-grid]:gap-4 [&_.stats-grid]:my-6
                         [&_.stat]:text-center [&_.stat]:p-4 [&_.stat]:bg-card [&_.stat]:rounded-lg [&_.stat]:border
                         [&_.stat_h4]:text-2xl [&_.stat_h4]:font-bold [&_.stat_h4]:text-secondary [&_.stat_h4]:mb-2
                         [&_.results]:bg-green-50 [&_.results]:dark:bg-green-950/20 [&_.results]:p-4 [&_.results]:rounded [&_.results]:border [&_.results]:border-green-200 [&_.results]:dark:border-green-800"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />

            {/* Call to Action */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="text-center">
                <h3 className="text-xl font-bold text-primary mb-4">
                  Ready to Transform Your Business?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Let's discuss how we can help implement these strategies for your business.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="btn-secondary"
                    onClick={() => {
                      document.getElementById('contact')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start' 
                      });
                    }}
                  >
                    Get In Touch
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      document.getElementById('quote-wizard')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start' 
                      });
                    }}
                  >
                    Start a Project
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-24 bg-gradient-subtle">
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
            Our <span className="text-gradient">Blog</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Insights, tips, and updates from the world of digital business. 
            Learn how to grow your business with the latest technology trends.
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
              {category === 'all' ? 'All Posts' : category}
            </motion.button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="card-feature group h-full cursor-pointer">
                {/* Blog Post Image */}
                <div className="relative overflow-hidden rounded-t-xl bg-gradient-secondary aspect-video">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl mb-3 group-hover:text-secondary transition-colors">
                      {post.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  </CardHeader>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.publishDate).toLocaleDateString('en-NZ')}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Read More Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-secondary group-hover:text-primary transition-colors"
                    onClick={() => openFullPost(post)}
                  >
                    Read More
                    <ArrowRight className="ml-2 w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-primary mb-4">
            Stay Updated with Our Latest Insights
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Want to learn more about growing your business with technology? 
            Let's have a conversation about your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="btn-secondary"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }}
            >
              Get In Touch
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                document.getElementById('quote-wizard')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }}
            >
              Start a Project
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;