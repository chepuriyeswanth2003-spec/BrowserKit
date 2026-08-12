import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  toolType?: string;
  category?: string;
  steps?: string[];
  faqs?: { question: string; answer: string }[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'BrowserKit Studio PRO — Free Client-Side PDF, Image & Video Utilities',
  description = 'Process images, PDFs, videos, and zip files 100% locally inside your browser with maximum speed, zero server uploads, and complete privacy.',
  keywords = ['free pdf tools', 'image converter', 'passport photo maker', 'online video editor', 'privacy first browser tools', 'compress image under 100kb free', 'convert heic to jpg on mac', 'remove pdf password online'],
  canonicalUrl = 'https://browserkit.co.in/',
  ogImage = 'https://browserkit.co.in/og-image.png',
  toolType,
  category,
  steps,
  faqs = [
    {
      question: 'Is BrowserKit Studio PRO completely free to use?',
      answer: 'Yes, BrowserKit Studio PRO is 100% free with zero file limits, registration requirements, or hidden paywalls.',
    },
    {
      question: 'Are my files uploaded to any external server?',
      answer: 'No! All conversions and processing occur 100% locally in your web browser using WebAssembly and HTML5 Web APIs.',
    },
  ],
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or update meta tag
    const setMetaTag = (nameAttr: string, valAttr: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${valAttr}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, valAttr);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords.join(', '));
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('name', 'author', 'BrowserKit Studio');

    // 4. Update OpenGraph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'BrowserKit Studio PRO');
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', title);

    // 5. Update Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 7. Update Hreflang Attributes (Internationalization SEO)
    const setHreflang = (lang: string, href: string) => {
      let hreflangTag = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!hreflangTag) {
        hreflangTag = document.createElement('link');
        hreflangTag.setAttribute('rel', 'alternate');
        hreflangTag.setAttribute('hreflang', lang);
        document.head.appendChild(hreflangTag);
      }
      hreflangTag.setAttribute('href', href);
    };

    setHreflang('x-default', canonicalUrl);
    setHreflang('en', canonicalUrl);

    // 8. Inject WebApplication, SoftwareApplication, HowTo & FAQ JSON-LD Schemas
    const schemaId = 'browserkit-seo-jsonld';
    let schemaScript = document.getElementById(schemaId) as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const jsonLdData: any = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${canonicalUrl}#webapp`,
        name: title,
        description: description,
        url: canonicalUrl,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires HTML5 and WebAssembly compatible web browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software`,
        name: title,
        operatingSystem: 'Windows, macOS, Linux, iOS, Android',
        applicationCategory: 'UtilitiesApplication',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1280',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://browserkit.co.in/',
          },
          ...(category
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: category,
                  item: canonicalUrl,
                },
              ]
            : []),
        ],
      },
    ];

    // Optional HowTo Schema for Step-by-Step Instructions
    if (steps && steps.length > 0) {
      jsonLdData.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use ${title}`,
        description: description,
        step: steps.map((stepText, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: `Step ${idx + 1}`,
          text: stepText,
        })),
      });
    }

    // FAQ Schema
    if (faqs && faqs.length > 0) {
      jsonLdData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    schemaScript.textContent = JSON.stringify(jsonLdData);
  }, [title, description, keywords, canonicalUrl, ogImage, toolType, category, steps, faqs]);

  return null;
};
