import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
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
import { useAnalytics } from '@/components/useAnalytics';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Blog />
      <QuoteWizard />
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
