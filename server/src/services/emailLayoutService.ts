import fs from 'fs';
import path from 'path';

/**
 * emailLayoutService — single source of truth for Good Circles email brand rendering.
 *
 * Locked aesthetic: the waitlist look (formerly waitlistEmailService) as the base —
 * gradient header, 180px logo, white body card, role accents, heavy headlines,
 * pill CTA, branded footer. All outbound email (transactional, waitlist, admin
 * compose, future mass campaigns) renders through this module so every send is
 * visually identical and on-brand.
 *
 * Logo: embedded as a CID inline attachment so it renders even when mail clients
 * (Gmail/Outlook) block remote images — the root cause of the previously "broken"
 * logo. Falls back to alt text if a client strips CID.
 */

const APP_URL = process.env.APP_URL || 'https://goodcircles.org';

// ── Brand tokens (single source of truth) ───────────────────────────────────
export const BRAND = {
  purple:   '#7851A9',
  lavender: '#CA9CE1',
  gold:     '#C2A76F',
  green:    '#059669',
  crimson:  '#A20021',
  gray:     '#6B7280',
  lightBg:  '#F9FAFB',
  purpleBg: '#F0EBFF',
  border:   '#E5E7EB',
  ink:      '#1a1a1a',
  pageBg:   '#f3f0f8',
};

// ── Role accents + labels ────────────────────────────────────────────────────
export const ROLE_ACCENTS: Record<string, string> = {
  NEIGHBOR:  BRAND.green,
  MERCHANT:  BRAND.gold,
  NONPROFIT: BRAND.crimson,
  CDFI:      '#9a7d3a',
  MUNICIPAL: '#1e3a5f',
};

export const ROLE_LABELS: Record<string, string> = {
  NEIGHBOR:  'Neighbor',
  MERCHANT:  'Merchant',
  NONPROFIT: 'Nonprofit',
  CDFI:      'CDFI Partner',
  MUNICIPAL: 'Municipal Partner',
};

// ── Sender aliases (locked set — no other from/reply-to addresses permitted) ──
export const FROM_ADDRESSES = {
  marketing:     'Good Circles <hello@goodcircles.org>',
  transactional: 'Good Circles <notifications@goodcircles.org>',
  support:       'Good Circles <support@goodcircles.org>',
  founder:       'Good Circles <founder@goodcircles.org>',
} as const;

// ── CID logo attachment ──────────────────────────────────────────────────────
// Read the high-res white logo from disk once and cache it as base64 for inline
// (CID) embedding. dist/logos is the deployed location; public/logos is the dev
// source. Either resolves relative to process.cwd().
export const LOGO_CID = 'gc-logo';

let cachedLogo: { filename: string; content: string; contentId: string } | null | undefined;

export function getLogoAttachment(): { filename: string; content: string; contentId: string } | null {
  if (cachedLogo !== undefined) return cachedLogo;
  const candidates = [
    path.join(process.cwd(), 'dist', 'logos', 'logo-white.png'),
    path.join(process.cwd(), 'public', 'logos', 'logo-white.png'),
  ];
  for (const p of candidates) {
    try {
      const buf = fs.readFileSync(p);
      cachedLogo = { filename: 'good-circles-logo.png', content: buf.toString('base64'), contentId: LOGO_CID };
      return cachedLogo;
    } catch { /* try next */ }
  }
  console.warn('[emailLayout] logo asset not found in dist/logos or public/logos — falling back to hosted URL');
  cachedLogo = null;
  return cachedLogo;
}

// Logo markup: prefer CID (renders with images blocked); fall back to hosted URL.
function logoImg(): string {
  const src = getLogoAttachment() ? `cid:${LOGO_CID}` : `${APP_URL}/logos/logo-white.png`;
  // 832x445 source displayed at 180px wide (≈96px tall) — crisp on retina.
  return `<img src="${src}" alt="Good Circles" width="180" height="96"
    style="display:block;margin:0 auto 12px;max-width:180px;height:auto;border:0;outline:none;text-decoration:none;" />`;
}

// ── Building blocks ──────────────────────────────────────────────────────────

export function heading(text: string, accent: string = BRAND.ink): string {
  return `<h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:${accent};line-height:1.15;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${text}</h1>`;
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">${html}</p>`;
}

export function button(label: string, url: string, style: 'pill' | 'solid' = 'pill'): string {
  if (style === 'solid') {
    return `<div style="text-align:center;margin:28px 0 8px;">
      <a href="${url}" style="background:${BRAND.purple};color:#fff;padding:13px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.5px;display:inline-block;font-family:Arial,sans-serif;">${label}</a>
    </div>`;
  }
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr><td align="center">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${BRAND.purple},${BRAND.lavender});color:#fff;font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:50px;">${label}</a>
  </td></tr></table>`;
}

// Striped two/three-column data table (kept from the transactional system for receipts).
export function dataTable(rows: [string, string, string?][]): string {
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    ${rows.map(([label, value, color], i) => `
    <tr style="background:${i % 2 === 0 ? BRAND.lightBg : '#fff'};">
      <td style="padding:10px 14px;font-weight:600;color:#374151;width:48%;">${label}</td>
      <td style="padding:10px 14px;color:${color || '#111'};">${value}</td>
    </tr>`).join('')}
  </table>`;
}

// Left-accent callout panel (used by welcomes / impact notes).
export function callout(title: string, bodyHtml: string, accent: string = BRAND.purple): string {
  return `<div style="background:${BRAND.purpleBg};border-left:4px solid ${accent};padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
    ${title ? `<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:0.5px;">${title}</p>` : ''}
    <div style="font-size:14px;color:#374151;line-height:1.6;">${bodyHtml}</div>
  </div>`;
}

// Bordered highlight pill (used for the founding invite code).
export function highlightCard(label: string, value: string, sub: string, accent: string = BRAND.purple): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
    <td style="background:#f8f5ff;border:2px solid ${accent};border-radius:12px;padding:20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};">${label}</p>
      <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:4px;color:${BRAND.ink};font-family:monospace;">${value}</p>
      ${sub ? `<p style="margin:8px 0 0;font-size:12px;color:#888;line-height:1.5;">${sub}</p>` : ''}
    </td></tr></table>`;
}

// ── Footer variants ──────────────────────────────────────────────────────────
// TRANSACTIONAL: light, no unsubscribe (CAN-SPAM exempt operational mail).
// MARKETING: dark, requires physical address + unsubscribe (CAN-SPAM). The
//   address is read from EMAIL_PHYSICAL_ADDRESS; mass-marketing pre-flight blocks
//   the send if it is unset (see emailCampaignService, future epic).
export type FooterVariant = 'TRANSACTIONAL' | 'MARKETING';

function footer(variant: FooterVariant, opts?: { extra?: string; unsubscribeUrl?: string }): string {
  if (variant === 'MARKETING') {
    const address = process.env.EMAIL_PHYSICAL_ADDRESS || '';
    return `<tr><td style="background:${BRAND.ink};border-radius:0 0 16px 16px;padding:24px;text-align:center;">
      ${opts?.extra ? `<p style="margin:0 0 8px;color:rgba(255,255,255,0.6);font-size:12px;line-height:1.5;">${opts.extra}</p>` : ''}
      <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:11px;">&copy; ${new Date().getFullYear()} Good Circles &mdash; A community marketplace</p>
      ${address ? `<p style="margin:0 0 8px;color:rgba(255,255,255,0.35);font-size:10px;">${address}</p>` : ''}
      ${opts?.unsubscribeUrl ? `<p style="margin:0;color:rgba(255,255,255,0.4);font-size:10px;"><a href="${opts.unsubscribeUrl}" style="color:rgba(255,255,255,0.55);text-decoration:underline;">Unsubscribe</a></p>` : ''}
    </td></tr>`;
  }
  // TRANSACTIONAL (light)
  return `<tr><td style="background:${BRAND.lightBg};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
    ${opts?.extra ? `<p style="margin:0 0 8px;color:${BRAND.gray};font-size:12px;line-height:1.5;">${opts.extra}</p>` : ''}
    <p style="margin:0;color:#9CA3AF;font-size:11px;">Good Circles &bull; Building community, one circle at a time.</p>
    <p style="margin:6px 0 0;color:#D1D5DB;font-size:10px;">Questions? <a href="mailto:support@goodcircles.org" style="color:${BRAND.purple};text-decoration:none;">support@goodcircles.org</a></p>
  </td></tr>`;
}

// ── The shell ────────────────────────────────────────────────────────────────
export interface WrapOptions {
  body: string;
  footerVariant?: FooterVariant;
  footerExtra?: string;
  unsubscribeUrl?: string;
}

export function wrap(opts: WrapOptions): string {
  const variant = opts.footerVariant ?? 'TRANSACTIONAL';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Good Circles</title></head>
<body style="margin:0;padding:0;background:${BRAND.pageBg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.pageBg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,${BRAND.purple} 0%,${BRAND.lavender} 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          ${logoImg()}
          <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Community Marketplace</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
          ${opts.body}
        </td></tr>
        ${footer(variant, { extra: opts.footerExtra, unsubscribeUrl: opts.unsubscribeUrl })}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
