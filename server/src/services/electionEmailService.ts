// Meridian early-access election emails (2026-07-06).
// HONESTY RULES: member-facing emails NEVER include signup counts, election
// counts, vote totals, rankings, or any traction signal — founding-member
// voice only. The weekly digest DOES include counts and is strictly
// admin/founder-only (never a member-facing send).
import {
  wrap, heading, paragraph, button, callout,
  BRAND, FROM_ADDRESSES,
} from './emailLayoutService';
import { sendEmail } from './emailService';

const ELECTION_FOOTER =
  'You received this because you made your election at goodcircles.org/meridian.';

const API_BASE = process.env.PUBLIC_API_URL ?? 'https://goodcircles-production.up.railway.app';

export interface ElectionVerifyParams {
  email: string;
  firstName?: string | null;
  nonprofitName: string;
  token: string;
}

export async function sendElectionVerifyEmail(params: ElectionVerifyParams): Promise<boolean> {
  const { email, firstName, nonprofitName, token } = params;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi neighbor,';
  const verifyUrl = `${API_BASE}/api/election/verify/${token}`;

  const body = `
    ${heading("You're an early member in Meridian.")}
    ${paragraph(`${greeting} One click left. Confirm your email below and your election is locked in — we'll let <strong style="color:${BRAND.ink};">${nonprofitName}</strong> know another neighbor has their back.`)}
    ${button('Confirm my election →', verifyUrl)}
    ${callout('Why confirm?', 'Elections only count from a confirmed email — it keeps the process honest for every organization on the ballot. Your election and business picks are recorded the moment you confirm.')}
    ${paragraph(`When Good Circles opens in Meridian, about <strong>10% of the net profit</strong> on every local purchase you make will fund ${nonprofitName} — automatically, at no cost to you or to them. You shop, you save about 10%, your cause gets funded, and the business keeps 89% of its profit.`)}
    <p style="margin:0;font-size:12px;color:#999;">If you didn't request this, you can ignore this email — nothing is recorded without confirmation.</p>
  `;

  return sendEmail({
    to: email,
    toName: firstName || 'Neighbor',
    subject: 'Confirm your election — Good Circles Meridian early access',
    from: FROM_ADDRESSES.marketing,
    html: wrap({ body, footerVariant: 'MARKETING', footerExtra: ELECTION_FOOTER }),
    meta: { triggerSource: 'ELECTION_VERIFY', layoutVariant: 'MARKETING' },
  });
}

export interface ElectionDigestRow {
  name: string;
  count: number;
}

export interface ElectionDigestParams {
  topNonprofits: ElectionDigestRow[]; // top 10 by verified elections
  topBusinesses: ElectionDigestRow[]; // top 15 by verified votes
  pendingSuggestions: number;
  totalVerified: number;
}

// ADMIN-ONLY weekly digest. Contains private demand counts by design — the
// recipient is the founder alias, never a member or public list.
export async function sendElectionWeeklyDigest(params: ElectionDigestParams): Promise<boolean> {
  const { topNonprofits, topBusinesses, pendingSuggestions, totalVerified } = params;
  const to = process.env.ELECTION_DIGEST_TO ?? 'founder@goodcircles.org';

  const rows = (list: ElectionDigestRow[]) =>
    list.length
      ? list
          .map(
            (r, i) =>
              `<tr><td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${i + 1}. ${r.name}</td><td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px;color:${BRAND.ink};text-align:right;font-weight:700;">${r.count}</td></tr>`,
          )
          .join('')
      : `<tr><td style="padding:6px 8px;font-size:13px;color:#888;">No verified activity yet.</td></tr>`;

  const body = `
    ${heading('Meridian demand — weekly digest')}
    ${paragraph(`<strong>Private / admin-only.</strong> ${totalVerified} verified member election(s) total. ${pendingSuggestions} suggestion(s) pending moderation.`)}
    <h2 style="margin:0 0 8px;font-size:15px;font-weight:700;color:${BRAND.ink};">Top 10 nonprofits by verified elections</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${rows(topNonprofits)}</table>
    <h2 style="margin:0 0 8px;font-size:15px;font-weight:700;color:${BRAND.ink};">Top 15 businesses by verified votes</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${rows(topBusinesses)}</table>
    <p style="margin:0;font-size:12px;color:#999;">Full rankings, filters, moderation, and CSV exports live in the Admin Portal → Meridian Demand. This data is confidential — never publish counts.</p>
  `;

  return sendEmail({
    to,
    toName: 'Good Circles Founder',
    subject: `Meridian weekly demand digest — private`,
    from: FROM_ADDRESSES.transactional,
    html: wrap({ body, footerVariant: 'TRANSACTIONAL', footerExtra: 'Internal admin digest — do not forward.' }),
    meta: { triggerSource: 'ELECTION_WEEKLY_DIGEST', layoutVariant: 'TRANSACTIONAL' },
  });
}
