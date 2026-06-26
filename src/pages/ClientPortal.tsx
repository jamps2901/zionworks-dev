import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import ClientLogin from '@/components/client/ClientLogin';
import ClientDashboard from '@/components/client/ClientDashboard';
import ClientOnboarding from '@/components/client/ClientOnboarding';
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  has_completed_onboarding: boolean;
}

const ClientPortal = () => {
  const [client, setClient] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleLogin = (clientData: ClientData) => {
    setClient(clientData);
    // Show onboarding if not completed
    if (!clientData.has_completed_onboarding) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    setClient(null);
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Refresh client data to reflect onboarding completion
    if (client) {
      const { data } = await supabase
        .from('client_users')
        .select('id, company_name, contact_name, email, phone, has_completed_onboarding')
        .eq('id', client.id)
        .single();
      
      if (data) {
        setClient(data);
      }
    }
  };

  return (
    <>
      <SEOHead 
        title="Client Portal - ZionWorks"
        description="Secure client portal for project tracking, communication, and file management"
        keywords="client portal, project tracking, secure access, communication"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        {!client ? (
          <ClientLogin onLogin={handleLogin} isLoading={isLoading} setIsLoading={setIsLoading} />
        ) : (
          <>
            <ClientDashboard client={client} onLogout={handleLogout} />
            {client && (
              <ClientOnboarding
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                clientId={client.id}
                clientName={client.contact_name}
                onComplete={handleOnboardingComplete}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ClientPortal;