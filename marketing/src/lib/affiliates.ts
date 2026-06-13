// Affiliate-link infrastructure for partner brands. Every outbound partner URL
// is produced here so the affiliate ID is env-driven (never hardcoded) and the
// tracking is consistent and replaceable. Links built with these helpers should
// carry rel="sponsored noopener" and data-affiliate="<partner>" in the markup
// (the data attribute drives the partner_click analytics event in Base.astro).
import { NM9T5_AFFILIATE_ID, NM9T5_URL } from '../data/site';

export interface Utm {
  medium?: string;
  campaign?: string;
  content?: string;
}

/**
 * Build a trackable, affiliate-tagged link to The No More 9 to 5 Club.
 * Always sets utm_source=goodcircles; adds am_id when PUBLIC_NM9T5_AFFILIATE_ID
 * is configured; adds utm_medium / utm_campaign / utm_content when provided.
 * Uses URLSearchParams so there is never a double "?" or "&".
 *
 *   nm9t5Link('/memberships', { medium: 'cta', campaign: 'veteran-landing' })
 *   → https://thenomore9to5club.org/memberships?am_id=<id>&utm_source=goodcircles&utm_medium=cta&utm_campaign=veteran-landing
 */
export function nm9t5Link(path: string, utm: Utm = {}): string {
  const url = new URL(path, NM9T5_URL);
  if (NM9T5_AFFILIATE_ID) url.searchParams.set('am_id', NM9T5_AFFILIATE_ID);
  url.searchParams.set('utm_source', 'goodcircles');
  if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  if (utm.content) url.searchParams.set('utm_content', utm.content);
  return url.href;
}

/** Absolute link to the No More 9 to 5 Foundation (the nonprofit arm). */
export function nm9t5FoundationLink(utm: Utm = {}): string {
  const url = new URL('https://thenomore9to5foundation.org/');
  if (NM9T5_AFFILIATE_ID) url.searchParams.set('am_id', NM9T5_AFFILIATE_ID);
  url.searchParams.set('utm_source', 'goodcircles');
  if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  if (utm.content) url.searchParams.set('utm_content', utm.content);
  return url.href;
}

/** Standard attributes for an affiliate anchor (FTC/Google-compliant). */
export const AFFILIATE_REL = 'sponsored noopener';
