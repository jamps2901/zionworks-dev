// SEO and Analytics utilities

// Schema.org structured data generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Zion Works",
  "url": "https://zionworks.dev",
  "logo": "https://zionworks.dev/logo.png",
  "description": "Digital transformation specialists serving the entire Waikato region including Hamilton, Cambridge, Te Kuiti, Taumarunui, Otorohanga and King Country. We build websites, mobile apps, e-commerce platforms, and AI solutions for local businesses.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Te Kuiti",
    "addressRegion": "Waikato",
    "addressCountry": "NZ"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+64223536095",
    "contactType": "customer service",
    "email": "contactus@zionworks.dev"
  },
  "sameAs": [
    "https://facebook.com/zionworks",
    "https://linkedin.com/company/zionworks"
  ],
  "areaServed": [
    {
      "@type": "City",
      "name": "Hamilton",
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "City", 
      "name": "Cambridge",
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "City",
      "name": "Te Kuiti", 
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "City",
      "name": "Taumarunui",
      "addressRegion": "Waikato", 
      "addressCountry": "NZ"
    },
    {
      "@type": "City",
      "name": "Otorohanga",
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "City",
      "name": "Matamata",
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "City",
      "name": "Tokoroa",
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "City",
      "name": "Putaruru",
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "State",
      "name": "Waikato",
      "addressCountry": "NZ"
    },
    {
      "@type": "Place",
      "name": "King Country",
      "addressRegion": "Waikato",
      "addressCountry": "NZ"
    }
  ]
});

export const generateLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Zion Works",
  "image": "https://zionworks.dev/hero-image.jpg",
  "description": "Professional web development and digital solutions for Waikato businesses. Specializing in websites, e-commerce, mobile apps, and AI integration. Serving Hamilton, Cambridge, Te Kuiti, Taumarunui, Otorohanga, and the entire King Country region.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Te Kuiti",
    "addressRegion": "Waikato",
    "postalCode": "3910",
    "addressCountry": "NZ"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -38.3362,
    "longitude": 175.1674
  },
  "telephone": "+64223536095",
  "email": "contactus@zionworks.dev",
  "url": "https://zionworks.dev",
  "priceRange": "$$",
  "openingHours": [
    "Mo-Fr 09:00-17:00"
  ],
  "paymentAccepted": "Credit Card, Bank Transfer",
  "currenciesAccepted": "NZD"
});

export const generateServiceSchema = (service: any) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.title,
  "description": service.description,
  "provider": {
    "@type": "Organization",
    "name": "Zion Works"
  },
  "areaServed": [
    "Hamilton",
    "Cambridge", 
    "Te Kuiti",
    "Taumarunui",
    "Otorohanga",
    "Matamata",
    "Tokoroa",
    "Putaruru",
    "King Country",
    "Waikato"
  ],
  "serviceType": service.category,
  "offers": {
    "@type": "Offer",
    "description": service.price
  }
});

export const generateBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Analytics tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      custom_parameter: true,
      ...parameters
    });
  }
  
  // Also track in console for development
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventName, parameters);
  }
};

export const trackConversion = (type: 'quote' | 'booking' | 'contact', value?: number) => {
  trackEvent('conversion', {
    conversion_type: type,
    value: value || 0,
    currency: 'NZD'
  });
};

export const trackPageView = (path: string, title: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title
    });
  }
};

// SEO meta tag generator
export const generateMetaTags = (page: {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}) => {
  const baseUrl = 'https://zionworks.dev';
  
  return {
    title: `${page.title} | Zion Works - King Country Web Development`,
    description: page.description,
    keywords: page.keywords || 'web development Hamilton, Cambridge web developer, Te Kuiti website design, Waikato digital marketing, King Country web development, e-commerce New Zealand, AI solutions, mobile app development',
    ogTitle: page.title,
    ogDescription: page.description,
    ogImage: page.ogImage || `${baseUrl}/hero-image.jpg`,
    ogUrl: page.canonicalUrl || baseUrl,
    twitterCard: 'summary_large_image',
    canonicalUrl: page.canonicalUrl || baseUrl
  };
};

// Performance and Core Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Track page load time
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      trackEvent('page_timing', {
        page_load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        first_contentful_paint: Math.round(perfData.responseStart - perfData.requestStart)
      });
    });

    // Track Core Web Vitals if available
    if ('web-vitals' in window) {
      // This would need the web-vitals library, but we'll track basic metrics for now
      trackEvent('core_web_vitals', {
        connection_type: (navigator as any).connection?.effectiveType || 'unknown'
      });
    }
  }
};