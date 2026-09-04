import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MessageSquare, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';

const included = [
  'Works on the site you already have -- Wix, Squarespace, Shopify, anything',
  'Answers customer questions 24/7, trained on your business',
  'Set up and configured for you -- nothing to install yourself',
  'Change anything (hours, pricing, FAQs) anytime, just ask',
  'Cancel anytime, no lock-in contract',
];

const AiAssistant = () => {
  return (
    <>
      <SEOHead
        title="AI Assistant for Your Website"
        description="Add a 24/7 AI assistant to the website you already have. One flat monthly price, no quote required, set up for you."
        keywords="AI chatbot New Zealand, AI assistant small business, website chatbot subscription"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
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
            </div>
          </div>
        </header>

        {/* Hero: one thing, same restraint as the homepage now uses */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Assistant
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
              Your business,<br /><span className="text-gradient">answered instantly.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              An AI assistant on your existing website that answers customer questions
              day and night -- so a missed call is never a missed customer.
            </p>

            <div className="glass-card rounded-2xl p-8 max-w-sm mx-auto mb-8">
              <div className="text-5xl font-bold text-primary mb-1">
                $79<span className="text-lg font-medium text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">One flat price. No quotes, no surprises.</p>
              <Button
                size="lg"
                className="btn-hero w-full"
                onClick={() => {
                  window.location.href = '/#contact';
                }}
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                No self-serve signup yet -- get in touch and it's set up for you personally.
              </p>
            </div>
          </motion.div>
        </section>

        {/* What's included */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-8 text-center">What's included</h2>
            <div className="space-y-4">
              {included.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-10 text-center">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary mb-2">1. Quick chat</h3>
                <p className="text-sm text-muted-foreground">Tell me about your business -- what customers ask, your hours, your services.</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary mb-2">2. I set it up</h3>
                <p className="text-sm text-muted-foreground">You get a small snippet to paste into your existing site. Takes minutes, no developer needed.</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary mb-2">3. It just runs</h3>
                <p className="text-sm text-muted-foreground">Answers questions around the clock. Want something changed? Just message me.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-primary-foreground mb-4">
              Keep your website. Add the part that answers back.
            </h2>
            <Button
              size="lg"
              className="btn-secondary"
              onClick={() => { window.location.href = '/#contact'; }}
            >
              Get Started -- $79/month
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AiAssistant;
