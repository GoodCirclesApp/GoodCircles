// Site-wide constants + the brand entity used in structured data.
// ACCURACY CONTRACT (verified against constants.ts / financeEngine.ts):
//   shoppers save ~10% on LOCAL purchases (always "~" / "about");
//   a nonprofit gets 10% of the merchant's NET PROFIT per sale;
//   merchants keep 89% of profit (1% platform fee on profit);
//   bridge items carry no discount (~50% of commission → shared DAF pool);
//   launch September 2026, Jackson MS metro first;
//   founding caps: first 200 merchants, first 50 nonprofits.

export const SITE_URL = 'https://goodcircles.org';
export const SITE_NAME = 'Good Circles';

// Google Analytics 4 Measurement ID. This is a PUBLIC identifier (it ships in
// every page's HTML by design), not a secret — safe to commit. Override per
// environment with the PUBLIC_GA4_ID env var if ever needed.
export const GA4_MEASUREMENT_ID = 'G-GL2EMC1F1X';

// NM9t5 affiliate links live in marketing/src/lib/affiliates.ts — each campaign
// has its OWN unique link + am_id (no single universal ID). See that file.

export const ORG_DESCRIPTION =
  'A community marketplace where shopping local saves you money, funds nonprofits, and strengthens the place you live.';

// Founder name + Facebook confirmed by owner 2026-06-12. Add Instagram/TikTok
// to sameAs when those profiles exist. knowsAbout strengthens the entity for
// AI/Generative-Engine Optimization.
export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og.png`,
  description: ORG_DESCRIPTION,
  founder: { '@type': 'Person', name: 'Timothy Franklin' },
  foundingDate: '2026',
  areaServed: { '@type': 'State', name: 'Mississippi' },
  email: 'hello@goodcircles.org',
  sameAs: ['https://www.facebook.com/goodcirclesorg'],
  knowsAbout: [
    'community marketplace',
    'shop local',
    'small business',
    'nonprofit funding',
    'Jackson, Mississippi',
    'AmazonSmile alternative',
  ],
} as const;

// Reusable "Mention" JSON-LD for pages that reference the NM9t5 partner — helps
// search and AI crawlers understand the brand relationship (Phase 5).
export const NM9T5_URL = 'https://thenomore9to5club.org';
export function partnerMentionJsonLd(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mentions: {
      '@type': 'Organization',
      name: 'The No More 9 to 5 Club',
      url: NM9T5_URL,
      description:
        'A growth ecosystem that trains entrepreneurs at every stage, founded by Jason McNamara. A Good Circles recommended partner.',
    },
  };
}

export const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
} as const;

// Canonical URL form is trailing-slash (matches the sitemap and Netlify's
// directory-style URLs), except for file paths like /og.png.
export function absoluteUrl(path: string): string {
  const url = new URL(path, SITE_URL);
  if (!/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('/')) {
    url.pathname += '/';
  }
  return url.href;
}
