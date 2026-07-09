// Audience-tagged conversion tracking. No-ops when GA4 isn't configured
// (PUBLIC_GA4_ID unset) so signup flows never depend on analytics.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackSignup(audience: string, extra?: Record<string, unknown>) {
  try {
    // Attribute the conversion to the AI engine that referred the visit, if any
    // (captured by AiReferral.astro into sessionStorage), so AI-sourced signups
    // are measurable as their own segment.
    let aiSource: string | undefined;
    try {
      aiSource = sessionStorage.getItem('gc_ai_source') ?? undefined;
    } catch {
      /* sessionStorage may be unavailable */
    }
    window.gtag?.('event', 'sign_up', {
      method: 'waitlist',
      audience,
      ...(aiSource ? { ai_source: aiSource } : {}),
      ...extra,
    });
  } catch {
    // analytics must never break the signup flow
  }
}
