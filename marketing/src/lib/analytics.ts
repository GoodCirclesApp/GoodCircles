// Audience-tagged conversion tracking. No-ops when GA4 isn't configured
// (PUBLIC_GA4_ID unset) so signup flows never depend on analytics.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackSignup(audience: string, extra?: Record<string, unknown>) {
  try {
    window.gtag?.('event', 'sign_up', {
      method: 'waitlist',
      audience,
      ...extra,
    });
  } catch {
    // analytics must never break the signup flow
  }
}
