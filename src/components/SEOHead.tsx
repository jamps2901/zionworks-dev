import React from 'react';
import { generateOrganizationSchema, generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/lib/seo';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  schemaData?: any[];
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = 'web development, Te Kuiti, King Country, website design, digital marketing, e-commerce',
  ogImage = '/hero-image.jpg',
  canonicalUrl,
  schemaData = [],
  noIndex = false
}) => {
  const baseUrl = 'https://zionworks.dev';
  const fullTitle = `${title} | Zion Works - King Country Web Development`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  const fullCanonicalUrl = canonicalUrl || baseUrl;

  // Default schema data
  const defaultSchemas = [
    generateOrganizationSchema(),
    generateLocalBusinessSchema(),
    ...schemaData
  ];

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Zion Works" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Zion Works" />
      <meta property="og:locale" content="en_NZ" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0F172A" />
      <meta name="msapplication-TileColor" content="#0F172A" />
      
      {/* Local Business Meta */}
      <meta name="geo.region" content="NZ-WKO" />
      <meta name="geo.placename" content="Te Kuiti" />
      <meta name="geo.position" content="-38.3362;175.1674" />
      <meta name="ICBM" content="-38.3362, 175.1674" />

      {/* Schema.org Structured Data */}
      {defaultSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}

      {/* Google Analytics (when configured) */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID', {
              page_title: '${title}',
              page_location: '${fullCanonicalUrl}',
              custom_map: {
                'custom_parameter': 'page_type'
              }
            });
          `
        }}
      />
    </>
  );
};