import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Play, Zap, Users, Award, MessageCircle, Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import heroImage from '../assets/hero-bg.jpg';
import ChatBot from './ChatBot';
import { supabase } from '@/integrations/supabase/client';
import { useMagneticHover } from '@/hooks/useMagneticHover';
import type { HeroBrief } from './QuoteWizard';

const PROJECT_TYPE_LABELS: Record<string, string> = {
  website: 'Website', app: 'Mobile App', ai: 'AI Solution', custom: 'Custom Software',
};
const TIMELINE_LABELS: Record<string, string> = {
  urgent: '2-4 weeks', standard: '1-2 months', flexible: '3+ months',
};
const BUDGET_LABELS: Record<string, string> = {
  small: '$2k-5k', medium: '$5k-15k', large: '$15k-50k', enterprise: '$50k+',
};

interface HeroProps {
  onBriefReady?: (brief: HeroBrief) => void;
}

const Hero = ({ onBriefReady }: HeroProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroPrompt, setHeroPrompt] = useState('');
  const [isGeneratingHeroBrief, setIsGeneratingHeroBrief] = useState(false);
  const [heroBriefResult, setHeroBriefResult] = useState<HeroBrief | null>(null);

  const ref = useRef(null);
  const isInView = useInView(ref);
  const controls = useAnimation();
  const quoteBtn = useMagneticHover(0.25);
  const workBtn = useMagneticHover(0.25);

  const fullText = 'to the Cloud';

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Typing animation for "to the Cloud"
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setShowCursor(false);
      }
    }, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(typingInterval);
    };
  }, []);

  const parallaxOffset = scrollY * 0.5;

  const handleHeroSubmit = async () => {
    const description = heroPrompt.trim();

    // Empty input: fall back to today's behavior, just scroll to the wizard.
    if (!description) {
      document.getElementById('quote-wizard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setIsGeneratingHeroBrief(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-brief', {
        body: { description },
      });

      if (error) throw error;

      setHeroBriefResult({
        description,
        project_type: data.project_type,
        timeline: data.timeline,
        budget: data.budget,
        summary: data.summary,
      });
    } catch (error) {
      console.error('Hero brief generation error:', error);
      // Fails gracefully into the normal manual flow rather than dead-ending.
      document.getElementById('quote-wizard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setIsGeneratingHeroBrief(false);
    }
  };

  const handleContinueToQuote = () => {
    if (heroBriefResult) {
      onBriefReady?.(heroBriefResult);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="animated-bg absolute inset-0" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${parallaxOffset}px)`,
          }}
        />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 z-10">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center px-6 py-3 glass-card rounded-full text-secondary text-sm font-medium mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Tūrangawaewae of Tech – Proudly King Country Grown 🇳🇿
          </motion.div>

          {/* Main Heading */}
          <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              From King Country
            </motion.span>
            <br />
            <motion.span
              className="text-gradient inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {typingText}
              {showCursor && <span className="animate-pulse">|</span>}
            </motion.span>
          </div>

          {/* Subheading */}
          <motion.p 
            className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Websites, apps, and AI automation for Kiwi businesses — built by a 
            local who answers the phone, ships fast, and charges a fair price.
          </motion.p>

          {/* Interactive AI Prompt + CTA, or the AI-drafted brief reveal */}
          <AnimatePresence mode="wait">
            {!heroBriefResult ? (
              <motion.div
                key="prompt"
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="flex-1 w-full sm:max-w-md">
                  <input
                    type="text"
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isGeneratingHeroBrief && handleHeroSubmit()}
                    placeholder="What are you building today?"
                    disabled={isGeneratingHeroBrief}
                    className="w-full px-6 py-4 rounded-2xl glass-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-secondary focus:outline-none text-lg disabled:opacity-60"
                  />
                </div>
                <motion.div
                  ref={quoteBtn.ref as React.RefObject<HTMLDivElement>}
                  style={{ x: quoteBtn.x, y: quoteBtn.y }}
                  {...quoteBtn.handlers}
                >
                  <Button
                    className="glow-button text-lg px-8 py-4 whitespace-nowrap"
                    disabled={isGeneratingHeroBrief}
                    onClick={handleHeroSubmit}
                  >
                    {isGeneratingHeroBrief ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Reading your idea...
                      </>
                    ) : (
                      <>
                        {heroPrompt.trim() ? 'Get AI Quote' : 'Get Your Quote'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                className="glass-card rounded-2xl p-6 text-left max-w-xl mx-auto mb-4 relative"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <button
                  onClick={() => { setHeroBriefResult(null); setHeroPrompt(''); }}
                  className="absolute top-3 right-3 text-primary-foreground/50 hover:text-primary-foreground transition-colors"
                  aria-label="Start over"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-secondary text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Here's what I picked up
                </p>
                <p className="text-primary-foreground text-lg mb-3 leading-relaxed">
                  {heroBriefResult.summary}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                    {PROJECT_TYPE_LABELS[heroBriefResult.project_type] || heroBriefResult.project_type}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                    {TIMELINE_LABELS[heroBriefResult.timeline] || heroBriefResult.timeline}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                    {BUDGET_LABELS[heroBriefResult.budget] || heroBriefResult.budget}
                  </span>
                </div>
                <Button className="glow-button w-full" onClick={handleContinueToQuote}>
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secondary CTA */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <motion.div
              ref={workBtn.ref as React.RefObject<HTMLDivElement>}
              style={{ x: workBtn.x, y: workBtn.y }}
              {...workBtn.handlers}
              className="inline-block"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary-foreground/20 backdrop-blur-sm border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/30 hover:border-primary-foreground/70 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-glow"
              >
                <Play className="mr-2 w-5 h-5" />
                See Our Work
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div 
            ref={ref}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-16 h-16 glass-card rounded-full mx-auto mb-4">
                <Zap className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-primary-foreground counter-animation">
                Piopio
              </div>
              <div className="text-primary-foreground/70 text-sm">
                Based in King Country<br />
                <span className="text-xs text-secondary">serving all of NZ remotely</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-16 h-16 glass-card rounded-full mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-primary-foreground counter-animation">
                ~14 days
              </div>
              <div className="text-primary-foreground/70 text-sm">
                Typical turnaround<br />
                <span className="text-xs text-secondary">from brief to live site</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-16 h-16 glass-card rounded-full mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-primary-foreground counter-animation">
                Direct
              </div>
              <div className="text-primary-foreground/70 text-sm">
                You deal with the founder<br />
                <span className="text-xs text-secondary">not an account manager</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Chat Widget */}
      <motion.div 
        className="fixed bottom-8 right-8 z-30"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="glass-card p-4 rounded-full shadow-glow hover:scale-110 transition-all duration-300 cursor-pointer relative"
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open AI chat assistant"
        >
          <img src="/favicon.png" alt="Zion Works Chat" className="w-6 h-6 object-contain" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-secondary rounded-full animate-pulse" />
        </motion.button>
      </motion.div>

      {/* Chat Bot */}
      <ChatBot isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-secondary/50 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div 
            className="w-1 h-3 bg-secondary rounded-full mt-2"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;