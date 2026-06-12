const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'https://goodcircles-production.up.railway.app';

export interface WaitlistPayload {
  email:      string;
  role:       string;
  zipCode?:   string;
  city?:      string;
  state?:     string;
  // NEIGHBOR
  preferredCauseHint?: string;
  // MERCHANT
  businessName?: string;
  website?:      string;
  category?:     string;
  // NONPROFIT
  orgName?: string;
  ein?:     string;
  // CDFI
  cdfiCertNumber?: string;
  lendingRegions?: string[];
  // MUNICIPAL
  jurisdiction?:      string;
  decisionMakerRole?: string;
  interestArea?:      string;
  requestBriefing?:   boolean;
  // Funnel metadata
  referrer?:    string;
  utmSource?:   string;
  utmCampaign?: string;
}

export interface WaitlistResponse {
  position?:          number;
  inviteCode?:        string;
  overflow?:          boolean;
  alreadyRegistered?: boolean;
}

export async function submitWaitlist(payload: WaitlistPayload): Promise<WaitlistResponse> {
  const res = await fetch(`${BASE}/api/waitlist`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      ...payload,
      referrer:    document.referrer || undefined,
      utmSource:   new URLSearchParams(window.location.search).get('utm_source')   || undefined,
      utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? 'Failed to join the waitlist. Please try again.');
  }
  return res.json();
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const res = await fetch(`${BASE}/api/waitlist/count`);
    if (!res.ok) return 2847;
    const data: { count: number } = await res.json();
    return data.count;
  } catch {
    return 2847;
  }
}
