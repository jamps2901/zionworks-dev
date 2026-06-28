import { useEffect } from 'react';
import { trackEvent, trackPageView, trackWebVitals } from '@/lib/seo';

interface UseAnalyticsProps {
  pageTitle: string;
  pagePath: string;
  trackVitals?: boolean;
}

export const useAnalytics = ({ pageTitle, pagePath, trackVitals = true }: UseAnalyticsProps) => {
  useEffect(() => {
    // Track page view
    trackPageView(pagePath, pageTitle);
    
    // Track web vitals if enabled
    if (trackVitals) {
      trackWebVitals();
    }
  }, [pageTitle, pagePath, trackVitals]);

  return {
    trackEvent,
    trackConversion: (type: 'quote' | 'booking' | 'contact', value?: number) => {
      trackEvent('conversion', {
        conversion_type: type,
        value: value || 0,
        currency: 'NZD',
        page_path: pagePath
      });
    },
    trackInteraction: (element: string, action: string) => {
      trackEvent('user_interaction', {
        element_type: element,
        action_type: action,
        page_path: pagePath
      });
    }
  };
};

// Hook for tracking form submissions
export const useFormTracking = () => {
  const trackFormStart = (formType: string) => {
    trackEvent('form_start', {
      form_type: formType,
      timestamp: Date.now()
    });
  };

  const trackFormComplete = (formType: string, success: boolean = true) => {
    trackEvent('form_complete', {
      form_type: formType,
      success,
      timestamp: Date.now()
    });
  };

  const trackFormError = (formType: string, error: string) => {
    trackEvent('form_error', {
      form_type: formType,
      error_message: error,
      timestamp: Date.now()
    });
  };

  return {
    trackFormStart,
    trackFormComplete,
    trackFormError
  };
};