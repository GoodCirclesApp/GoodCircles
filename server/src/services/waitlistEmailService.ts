import {
  wrap, heading, paragraph, button, highlightCard, callout,
  ROLE_ACCENTS, ROLE_LABELS, BRAND, FROM_ADDRESSES,
} from './emailLayoutService';
import { sendEmail } from './emailService';

const WAITLIST_FOOTER = 'You received this because you joined the Good Circles waitlist.';

export interface WaitlistOverflowParams {
  email: string;
  role:  string;
}

export async function sendWaitlistOverflowEmail(params: WaitlistOverflowParams): Promise<boolean> {
  const { email, role } = params;
  const roleLabel = ROLE_LABELS[role] ?? role;

  const body = `
    ${heading("You're on the interest list.")}
    ${paragraph(`Our founding circle is currently full, but we didn't want to lose you. We've added you to the interest list as a <strong>${roleLabel}</strong> — and you'll be the first to know the moment a spot opens.`)}
    ${callout('What happens next', "When a spot opens, you'll receive a direct invitation with a link to claim your place in the founding circle. No action needed on your end — just watch your inbox.")}
    ${button('Visit GoodCircles.org →', 'https://www.goodcircles.org')}
  `;

  // CAN-SPAM (compliance audit E1): confirms a user-initiated signup (interest-list
  // placement) — a transactional/relationship message. Classified TRANSACTIONAL so
  // it is not a marketing send missing an unsubscribe link / physical address.
  return sendEmail({
    to: email,
    toName: roleLabel,
    subject: "You're on the Good Circles interest list",
    from: FROM_ADDRESSES.transactional,
    html: wrap({ body, footerVariant: 'TRANSACTIONAL', footerExtra: WAITLIST_FOOTER }),
    meta: { triggerSource: 'WAITLIST_OVERFLOW', layoutVariant: 'TRANSACTIONAL' },
  });
}

export interface WaitlistConfirmParams {
  email:      string;
  role:       string;
  position:   number;
  inviteCode: string;
  firstName?: string;
}

export async function sendWaitlistConfirmEmail(params: WaitlistConfirmParams): Promise<boolean> {
  const { email, role, inviteCode, firstName } = params;
  const accent    = ROLE_ACCENTS[role] ?? BRAND.purple;
  const roleLabel = ROLE_LABELS[role] ?? role;
  const greeting  = firstName ? `Hi ${firstName},` : 'Welcome,';

  const body = `
    ${heading("You're in the founding circle.")}
    ${paragraph(`${greeting} Your founding spot as a <strong style="color:${BRAND.ink};">${roleLabel}</strong> is confirmed. When Good Circles launches in September 2026, you'll be among the first through the door — with founding status that's yours permanently.`)}
    ${highlightCard(
      'Your Founding Invite Code',
      inviteCode,
      "Keep this safe — it's your key to the marketplace at launch.<br/>Share it to bring others into the founding circle.",
      accent,
    )}
    <p style="margin:0 0 28px;font-size:13px;color:#888;text-align:center;font-style:italic;">The most powerful thing you can do right now? Tell one neighbor, one local business, or one nonprofit.</p>
    <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:${BRAND.ink};">What happens next</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><p style="margin:0;font-size:14px;color:#333;"><strong style="color:${accent};">1.</strong>&nbsp; We're finishing the final features before launch — you'll be notified as we get closer.</p></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><p style="margin:0;font-size:14px;color:#333;"><strong style="color:${accent};">2.</strong>&nbsp; You'll receive an exclusive early-access email with your personalized sign-in link.</p></td></tr>
      <tr><td style="padding:10px 0;"><p style="margin:0;font-size:14px;color:#333;"><strong style="color:${accent};">3.</strong>&nbsp; Your invite code <strong>${inviteCode}</strong> locks in your role and founding status at signup.</p></td></tr>
    </table>
    ${button('Grow your Good Circle →', 'https://www.goodcircles.org')}
  `;

  // CAN-SPAM (compliance audit E1): confirms a user-initiated signup and delivers
  // their founding invite code — primary purpose is transactional. Classified
  // TRANSACTIONAL so it is not a marketing send missing an unsubscribe / address.
  return sendEmail({
    to: email,
    toName: firstName || roleLabel,
    subject: "You're a founding member of Good Circles — your spot is confirmed",
    from: FROM_ADDRESSES.transactional,
    html: wrap({ body, footerVariant: 'TRANSACTIONAL', footerExtra: WAITLIST_FOOTER }),
    meta: { triggerSource: 'WAITLIST_CONFIRM', layoutVariant: 'TRANSACTIONAL' },
  });
}
