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

    let findAttempts = 0;
    const maxFindAttempts = 40; // ~10s at 250ms, generous for a slow first load

    // Instant, not smooth: this is a very long, image-heavy page, and an
    // animated smooth-scroll's target drifts under it while content below
    // the fold is still loading in, so it never visibly completes.
    // Even instant needs correcting repeatedly, not once -- confirmed live
    // that a single correction (or two) still gets overtaken by continued
    // layout shift for a few seconds after first paint. Keep correcting
    // until position holds steady across two checks in a row.
    const settleAndScroll = (el: HTMLElement) => {
      let lastY = -1;
      let stableCount = 0;
      const maxCorrections = 20; // ~6s at 300ms
      let corrections = 0;

      const correct = () => {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        if (window.scrollY === lastY) {
          stableCount++;
        } else {
          stableCount = 0;
        }
        lastY = window.scrollY;
        corrections++;
        if (stableCount < 2 && corrections < maxCorrections) {
          setTimeout(correct, 300);
        }
      };
      correct();
    };

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        settleAndScroll(el);
        return;
      }
      findAttempts++;
      if (findAttempts < maxFindAttempts) {
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
