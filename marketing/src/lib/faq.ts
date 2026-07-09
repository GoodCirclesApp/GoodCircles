// One FAQ array per page drives BOTH the visible accordion (FaqList.astro)
// and the FAQPage JSON-LD, so the schema `name` always matches the on-page
// question text character-for-character (the highest-weighted AEO signal).
//
// This module is the site's JSON-LD helper library. Beyond FAQPage/BreadcrumbList
// it provides Article, ItemList, Dataset, Product/Offer, Review/AggregateRating,
// and LocalBusiness builders used by the answer-first layout and the GEO pages.
import { SITE_URL, SITE_NAME } from '../data/site';

export interface Faq {
  q: string;
  a: string;
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── Article (answer-first pages, comparison hubs, research) ───────────────────
export interface ArticleArgs {
  headline: string;
  description: string;
  /** Absolute page URL. */
  url: string;
  datePublished: string; // ISO (YYYY-MM-DD)
  dateModified?: string; // defaults to datePublished
  /** Author name; an Organization by default, a Person if `authorType: 'Person'`. */
  author?: string;
  authorType?: 'Organization' | 'Person';
  image?: string;
}
export function articleJsonLd(a: ArticleArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    author: { '@type': a.authorType ?? 'Organization', name: a.author ?? SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og.png` },
    },
    mainEntityOfPage: a.url,
    ...(a.image ? { image: a.image } : {}),
  };
}

// ── ItemList (comparison tables / roundups — disproportionately AI-cited) ─────
export function itemListJsonLd(items: { name: string; url?: string; description?: string }[], name?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(name ? { name } : {}),
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url ? { url: it.url } : {}),
      ...(it.description ? { description: it.description } : {}),
    })),
  };
}

// ── Dataset (the Local Giving Index — original-data citation magnet) ──────────
export interface DatasetArgs {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  datePublished?: string;
  license?: string;
  creator?: string;
  distribution?: { url: string; encodingFormat: string }[];
  keywords?: string[];
}
export function datasetJsonLd(d: DatasetArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: d.name,
    description: d.description,
    url: d.url,
    datePublished: d.datePublished ?? d.dateModified,
    dateModified: d.dateModified,
    creator: { '@type': 'Organization', name: d.creator ?? SITE_NAME, url: SITE_URL },
    ...(d.license ? { license: d.license } : {}),
    ...(d.keywords ? { keywords: d.keywords } : {}),
    ...(d.distribution
      ? {
          distribution: d.distribution.map((x) => ({
            '@type': 'DataDownload',
            contentUrl: x.url,
            encodingFormat: x.encodingFormat,
          })),
        }
      : {}),
  };
}

// ── Product / Offer (scaffold for merchant listings at launch) ────────────────
export interface ProductArgs {
  name: string;
  description?: string;
  url: string;
  image?: string;
  brand?: string;
  price?: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'PreOrder' | 'OutOfStock';
  merchantName?: string;
}
export function productJsonLd(p: ProductArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    url: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    ...(p.merchantName ? { seller: { '@type': 'Organization', name: p.merchantName } } : {}),
    ...(p.price != null
      ? {
          offers: {
            '@type': 'Offer',
            price: String(p.price),
            priceCurrency: p.priceCurrency ?? 'USD',
            availability: `https://schema.org/${p.availability ?? 'PreOrder'}`,
          },
        }
      : {}),
  };
}

// ── Review / AggregateRating (component-ready for when testimonials exist) ────
export interface ReviewItem {
  author: string;
  body: string;
  rating: number; // 1–5
  datePublished?: string;
}
export function aggregateRatingJsonLd(ratingValue: number, reviewCount: number) {
  return {
    '@type': 'AggregateRating',
    ratingValue: String(ratingValue),
    reviewCount: String(reviewCount),
    bestRating: '5',
    worstRating: '1',
  };
}
/** Emits an Organization carrying aggregateRating + individual reviews. Returns
 *  null when there are no reviews, so callers can conditionally include it. */
export function reviewsJsonLd(reviews: ReviewItem[]) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    aggregateRating: aggregateRatingJsonLd(Math.round(avg * 10) / 10, reviews.length),
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewBody: r.body,
      reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5', worstRating: '1' },
      ...(r.datePublished ? { datePublished: r.datePublished } : {}),
    })),
  };
}

// ── LocalBusiness (city / merchant pages) ────────────────────────────────────
export interface LocalBusinessArgs {
  name: string;
  description: string;
  url: string;
  city: string;
  state?: string;
  areaServed?: string;
  image?: string;
}
export function localBusinessJsonLd(b: LocalBusinessArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    description: b.description,
    url: b.url,
    ...(b.image ? { image: b.image } : {}),
    areaServed: { '@type': 'City', name: b.areaServed ?? b.city },
    address: {
      '@type': 'PostalAddress',
      addressLocality: b.city,
      addressRegion: b.state ?? 'MS',
      addressCountry: 'US',
    },
  };
}
