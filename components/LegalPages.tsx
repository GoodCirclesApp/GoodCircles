import React, { useEffect, useRef } from 'react';

// Version string recorded against a user's account when they accept at signup.
// Bump this (and the "Last updated" dates below) whenever the legal copy changes
// materially — the stored value lets us tell who agreed to which version.
export const TERMS_VERSION = '2026-06-12';

export type LegalDoc = 'terms' | 'privacy' | 'cookies';

const TAB_LABELS: Record<LegalDoc, string> = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  cookies: 'Cookie Policy',
};

const LAST_UPDATED = 'June 12, 2026';

/**
 * In-app legal pages. Mirrors the canonical, owner-approved copy published on
 * goodcircles.org so the app is self-contained (the prior in-app "/terms" link
 * fell through to the SPA fallback and 404'd). Rendered as a focus-trapped
 * dialog overlay so it works both pre-login (AuthSystem) and post-login (footer).
 */
export const LegalPages: React.FC<{ doc: LegalDoc; onClose: () => void; onSelect: (d: LegalDoc) => void }> = ({ doc, onClose, onSelect }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={TAB_LABELS[doc]}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header + tabs */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-6 sm:px-8 pt-6 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tighter italic uppercase text-[#2E1B4E]">{TAB_LABELS[doc]}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Last updated {LAST_UPDATED}</p>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex gap-1 mt-4" role="tablist">
            {(Object.keys(TAB_LABELS) as LegalDoc[]).map(d => (
              <button
                key={d}
                role="tab"
                aria-selected={doc === d}
                onClick={() => onSelect(d)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${doc === d ? 'bg-[#7851A9] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {TAB_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 text-sm leading-relaxed text-slate-700 [&_h3]:text-base [&_h3]:font-black [&_h3]:text-[#2E1B4E] [&_h3]:uppercase [&_h3]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1 [&_a]:text-[#7851A9] [&_a]:font-bold [&_a]:underline">
          {doc === 'terms' && <TermsBody />}
          {doc === 'privacy' && <PrivacyBody />}
          {doc === 'cookies' && <CookiesBody />}
        </div>
      </div>
    </div>
  );
};

const TermsBody = () => (
  <>
    <p>
      These terms govern your use of Good Circles. The marketplace launches in September 2026,
      starting in the Jackson, Mississippi metro; marketplace-specific terms (purchases, payouts,
      returns) will be published before launch and will supplement these.
    </p>
    <h3>Your account</h3>
    <ul>
      <li>You are responsible for keeping your login secure and for activity under your account.</li>
      <li>Provide accurate information; don't register an organization you don't represent.</li>
      <li>No payment is collected, and no live purchase is possible, before launch.</li>
    </ul>
    <h3>How the model works</h3>
    <p>
      Shoppers save about 10% on local purchases, a chosen nonprofit receives 10% of the
      merchant's net profit on each sale, and merchants keep 89% of profit on a 1% platform fee.
      Exact amounts on a given sale depend on the item and merchant. External "bridge" items carry
      no shopper discount; a share of that commission funds a pooled nonprofit fund.
    </p>
    <h3>Acceptable use</h3>
    <p>
      Don't misuse the platform: no scraping for spam, no submitting organizations you don't
      represent, no attempting to disrupt the service or other people's accounts.
    </p>
    <h3>Intellectual property</h3>
    <p>
      The Good Circles name, the crown wordmark, and the content of this platform belong to Good
      Circles and may not be used without permission, except for sharing links and excerpts to
      tell people about the platform.
    </p>
    <h3>Disclaimers</h3>
    <p>
      The service is provided "as is." Before launch, features and dates described here may
      change. To the maximum extent permitted by law, Good Circles is not liable for indirect or
      consequential damages arising from use of the service.
    </p>
    <h3>Governing law</h3>
    <p>These terms are governed by the laws of the State of Mississippi, USA.</p>
    <h3>Contact</h3>
    <p>Questions about these terms? Email <a href="mailto:hello@goodcircles.org">hello@goodcircles.org</a>.</p>
  </>
);

const PrivacyBody = () => (
  <>
    <p>
      Good Circles ("we," "us") operates a community marketplace launching in September 2026. This
      policy explains what information we collect, how we use it, and the choices you have. The
      short version: we collect only what we need to run the circle, and <strong>we never sell
      your data</strong>.
    </p>
    <h3>What we collect</h3>
    <ul>
      <li><strong>Account details:</strong> your email, name, role (neighbor, merchant, nonprofit, CDFI, or municipal partner), and the password you set (stored only as a secure hash).</li>
      <li><strong>Business and nonprofit details:</strong> the organization information you provide, such as business name, category, organization name, or EIN.</li>
      <li><strong>Usage metadata:</strong> basic information needed to operate the marketplace, such as your orders, elected nonprofit, and impact totals.</li>
    </ul>
    <h3>How we use it</h3>
    <ul>
      <li>To run your account, process activity on the platform, and email you about your account. You can unsubscribe from non-essential email.</li>
      <li>To route your elected donation and show your community impact.</li>
      <li>To verify nonprofits against IRS public records before they can receive funding.</li>
    </ul>
    <h3>How information moves inside the circle</h3>
    <p>
      Good Circles is a community: relevant information is shared with the nonprofit you elect and
      the merchants you shop with — that's how the model works. No personal data is sold or shared
      outside the platform for advertising or any other purpose.
    </p>
    <h3>Service providers</h3>
    <p>
      We use a small number of providers to operate the service: hosting, our application backend,
      payment processing, and a transactional email service. Each processes data only on our
      instructions.
    </p>
    <h3>Your choices and rights</h3>
    <ul>
      <li>Unsubscribe from non-essential emails at any time via the link in every message.</li>
      <li>Request a copy of your data or ask us to delete it by emailing <a href="mailto:hello@goodcircles.org">hello@goodcircles.org</a>.</li>
      <li>We keep your data only as long as needed to operate the marketplace and meet legal obligations.</li>
    </ul>
    <h3>Children</h3>
    <p>Good Circles is not directed at children under 13, and we do not knowingly collect their information.</p>
    <h3>Changes</h3>
    <p>If this policy changes, we'll update the date at the top and, for material changes, notify you.</p>
    <h3>Contact</h3>
    <p>Questions? Email <a href="mailto:hello@goodcircles.org">hello@goodcircles.org</a>.</p>
  </>
);

const CookiesBody = () => (
  <>
    <p>Good Circles is deliberately light on tracking. Here's the complete picture.</p>
    <h3>What we use</h3>
    <ul>
      <li><strong>Essential storage:</strong> we use your browser's local storage to keep you signed in and remember your session and preferences. This is required for the app to work.</li>
      <li><strong>Analytics (if enabled):</strong> we may use a standard analytics tool to understand which features help people. Analytics identify a browser, not a person, and we use the data only in aggregate.</li>
    </ul>
    <h3>What we don't do</h3>
    <ul>
      <li>No advertising or retargeting cookies.</li>
      <li>No selling or sharing of browsing data.</li>
      <li>No third-party social trackers.</li>
    </ul>
    <h3>Your controls</h3>
    <p>
      You can block or delete cookies in your browser settings at any time; note that clearing
      essential storage will sign you out. If we later add a consent banner for analytics in
      regions that require one, your choice there will be respected.
    </p>
    <h3>Contact</h3>
    <p>Questions? Email <a href="mailto:hello@goodcircles.org">hello@goodcircles.org</a>.</p>
  </>
);
