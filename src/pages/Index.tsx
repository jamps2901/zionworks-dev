import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import About from '@/components/About';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Blog from '@/components/Blog';
import QuoteWizard from '@/components/QuoteWizard';
import BookingSystem from '@/components/BookingSystem';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import VoiceInterface from '@/components/VoiceInterface';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { HeroBrief } from '@/components/QuoteWizard';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroBrief, setHeroBrief] = useState<HeroBrief | null>(null);

  // Track page analytics
  const { trackInteraction } = useAnalytics({
    pageTitle: 'Home',
    pagePath: '/',
    trackVitals: true
  });

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    trackInteraction('chatbot', isChatOpen ? 'close' : 'open');
  };

  // Other pages link here with a #section hash (e.g. /ai-assistant's "Get
  // Started" button goes to /#contact). That's a full page load, so the
  // browser's own hash-scroll fires before this page's sections have
  // rendered and silently fails, landing at the top instead. A single fixed
  // delay isn't reliable here -- how long mount actually takes varies, so
  // poll for the target to exist instead of guessing a timeout.
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);

    let attempts = 0;
    const maxAttempts = 40; // ~10s at 250ms, generous for a slow first load
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryScroll, 250);
      }
    };
    tryScroll();
  }, []);

  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero onBriefReady={setHeroBrief} />
      <TrustStrip />
      <About />
      <Services />
      <Portfolio />
      <Blog />
      <QuoteWizard prefilledBrief={heroBrief} />
      <BookingSystem />
      <Contact />
      <Footer />
      <ChatBot isOpen={isChatOpen} onToggle={toggleChat} />
      {/* Voice Interface Component */}
      <VoiceInterface 
        onSpeakingChange={(speaking) => console.log('Voice speaking:', speaking)} 
        onMessage={(message) => console.log('Voice message:', message)}
      />
    </main>
  );
};

export default Index;
