// Affiliate-link infrastructure for The No More 9 to 5 Club.
//
// IMPORTANT: NM9t5's affiliate platform issues a UNIQUE link per campaign — each
// has its own path AND its own am_id. There is NO single universal affiliate ID.
// So links may only be built from the campaign registry below (verbatim from the
// owner's affiliate dashboard, 2026-06-13). Never append an am_id to an arbitrary
// page — that would mis-attribute or not credit the referral at all.
//
// Pages NM9t5 does NOT have a campaign for (e.g. the free Roadmap survey on "/",
// /ascend-the-ladder, the veterans page, the Foundation) must be linked PLAINLY
// via nm9t5PlainLink()/nm9t5FoundationLink() — no am_id, no commission, honest.
import { NM9T5_URL } from '../data/site';

// Campaign → exact dashboard URL (includes that campaign's own am_id).
// Comment shows the default commission shown in the dashboard.
export const NM9T5_CAMPAIGNS = {
  trial: 'https://thenomore9to5club.org/b-m-checkout-30days-trial?am_id=GoodCircles', // 33% — Basic Membership 30-Day Trial
  basic: 'https://thenomore9to5club.org/b-m-checkout?am_id=timothy7305', // 10% — Basic Membership (non-members)
  pro: 'https://thenomore9to5club.org/pro-membership?am_id=timothy7599', // 10% — Professional Membership (non-members)
  launchpad: 'https://www.thenomore9to5club.org/launchpad?am_id=timothy3898', // 33% — NM9T5 Launchpad
  scaling: 'https://thenomore9to5club.org/ds-pro?am_id=timothy5319', // 10% — Delegation and Scaling
  bma: 'https://thenomore9to5club.org/bma-checkout?am_id=timothy710', // 33% — Business Marketing Audit (pro members)
  dfy: 'https://thenomore9to5club.org/dfy-2500?am_id=timothy3101', // 33% — Done For You Service (pro members)
  vaLender: 'https://thenomore9to5club.org/va-lender-pro?am_id=timothy5435', // 10% — VA Lender Service
  summit: 'https://www.thenomore9to5club.org/lifestyle-summit?am_id=timothy2019', // 50% — Lifestyle Summit 2026 Q2
  proEvent: 'https://thenomore9to5club.org/professionalmeeting?am_id=timothy3508', // Professional Event
  basicEvent: 'https://thenomore9to5club.org/basic-membership-event?am_id=timothy4573', // Basic Membership Event
} as const;

export type CampaignKey = keyof typeof NM9T5_CAMPAIGNS;

export interface Utm {
  medium?: string;
  campaign?: string;
  content?: string;
}

/**
 * Build a trackable affiliate link for a specific NM9t5 campaign. The campaign's
 * own am_id is preserved from the registry; utm params are added for our own
 * analytics. Uses URL() so there's never a double "?"/"&".
 *
 *   nm9t5Link('trial', { medium: 'cta', campaign: 'veterans-landing' })
 */
export function nm9t5Link(campaign: CampaignKey, utm: Utm = {}): string {
  const url = new URL(NM9T5_CAMPAIGNS[campaign]);
  url.searchParams.set('utm_source', 'goodcircles');
  if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  if (utm.content) url.searchParams.set('utm_content', utm.content);
  return url.href;
}

/** Convenience: the 30-day trial (the owner's primary, 33% commission). */
export function nm9t5TrialLink(utm: Utm = {}): string {
  return nm9t5Link('trial', utm);
}

/**
 * Plain (non-affiliate, non-commission) link to a NM9t5 page that has no
 * campaign — e.g. the free Roadmap survey on "/". No am_id is added, by design.
 */
export function nm9t5PlainLink(path = '/', utm: Utm = {}): string {
  const url = new URL(path, NM9T5_URL);
  url.searchParams.set('utm_source', 'goodcircles');
  if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  return url.href;
}

/** Plain link to the No More 9 to 5 Foundation (no campaign exists for it). */
export function nm9t5FoundationLink(utm: Utm = {}): string {
  const url = new URL('https://thenomore9to5foundation.org/');
  url.searchParams.set('utm_source', 'goodcircles');
  if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  return url.href;
}

/** Standard attributes for an affiliate anchor (FTC/Google-compliant). */
export const AFFILIATE_REL = 'sponsored noopener';

/** FTC affiliate-disclosure text — render on every page that carries an affiliate link. */
export const AFFILIATE_DISCLOSURE =
  'Disclosure: Good Circles may earn a commission if you join the No More 9 to 5 Club through links on this page, at no extra cost to you. We recommend partners on the merits of the fit, not the commission.';
