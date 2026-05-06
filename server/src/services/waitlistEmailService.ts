import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = 'GoodCircles <hello@goodcircles.org>';
const APP_URL = process.env.APP_URL || 'https://goodcircles-production.up.railway.app';
const LOGO   = `${APP_URL}/logos/logo-white-md.png`;

const B = {
  purple:   '#7851A9',
  lavender: '#CA9CE1',
  gold:     '#C2A76F',
  emerald:  '#059669',
  crimson:  '#A20021',
};

const ROLE_COLORS: Record<string, string> = {
  NEIGHBOR:  B.emerald,
  MERCHANT:  B.gold,
  NONPROFIT: B.crimson,
  CDFI:      '#9a7d3a',
  MUNICIPAL: '#1e3a5f',
};

const ROLE_LABELS: Record<string, string> = {
  NEIGHBOR:  'Neighbor',
  MERCHANT:  'Merchant',
  NONPROFIT: 'Nonprofit',
  CDFI:      'CDFI Partner',
  MUNICIPAL: 'Municipal Partner',
};

const ROLE_PERKS: Record<string, string> = {
  NEIGHBOR:  'At launch, you\'ll receive one free month of double-impact credits — your savings double, your nonprofit gets twice the donation.',
  MERCHANT:  'As an early merchant, your onboarding fee is waived and your first month on the platform is free.',
  NONPROFIT: 'Your nonprofit will be pre-verified and visible to neighbors from day one — no waiting in a queue.',
  CDFI:      'You\'ll receive a private briefing with our founding team before the public launch.',
  MUNICIPAL: 'You\'ll receive a private briefing with our founding team before the public launch.',
};

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GoodCircles</title>
</head>
<body style="margin:0;padding:0;background:#f3f0f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,${B.purple} 0%,${B.lavender} 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <img src="${LOGO}" alt="GoodCircles" width="180" height="auto"
               style="display:block;margin:0 auto 12px;max-width:180px;" />
          <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Community Marketplace</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 40px 32px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a1a1a;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:11px;">
            &copy; ${new Date().getFullYear()} GoodCircles &mdash; A community marketplace
          </p>
          <p style="margin:0;color:rgba(255,255,255,0.35);font-size:10px;">
            You received this because you joined the GoodCircles waitlist.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface WaitlistConfirmParams {
  email:      string;
  role:       string;
  position:   number;
  inviteCode: string;
  firstName?: string;
}

export async function sendWaitlistConfirmEmail(params: WaitlistConfirmParams): Promise<boolean> {
  const { email, role, position, inviteCode, firstName } = params;
  const accentColor = ROLE_COLORS[role] ?? B.purple;
  const roleLabel   = ROLE_LABELS[role] ?? role;
  const perk        = ROLE_PERKS[role] ?? '';
  const greeting    = firstName ? `Hi ${firstName},` : 'Welcome,';

  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#1a1a1a;line-height:1.1;">
      You're #${position.toLocaleString()} in the circle.
    </h1>
    <p style="margin:0 0 28px;font-size:16px;color:#555;">
      ${greeting} You're officially on the GoodCircles waitlist as a <strong>${roleLabel}</strong>.
      We'll reach out the moment the marketplace opens.
    </p>

    <!-- Invite code pill -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="background:#f8f5ff;border:2px solid ${accentColor};border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accentColor};">
          Your Invite Code
        </p>
        <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:4px;color:#1a1a1a;font-family:monospace;">
          ${inviteCode}
        </p>
        <p style="margin:6px 0 0;font-size:12px;color:#888;">
          Keep this — it unlocks your launch-day perks.
        </p>
      </td></tr>
    </table>

    ${perk ? `
    <!-- Launch perk -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="background:#f0fdf4;border-left:4px solid ${B.emerald};border-radius:0 8px 8px 0;padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${B.emerald};">
          Your Early-Access Perk
        </p>
        <p style="margin:0;font-size:14px;color:#374151;">${perk}</p>
      </td></tr>
    </table>` : ''}

    <!-- What's next -->
    <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#1a1a1a;">What happens next?</h2>
    <p style="margin:0 0 8px;font-size:14px;color:#555;">
      1. We're building out the final features before launch.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#555;">
      2. You'll get an exclusive early-access email with your personalized magic link.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#555;">
      3. Your invite code <strong>${inviteCode}</strong> redeems your launch perks automatically at signup.
    </p>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://www.goodcircles.org"
           style="display:inline-block;background:linear-gradient(135deg,${B.purple},${B.lavender});color:#fff;
                  font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;
                  text-decoration:none;padding:14px 36px;border-radius:50px;">
          Visit GoodCircles.org &rarr;
        </a>
      </td></tr>
    </table>
  `;

  try {
    const result = await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: `You're #${position.toLocaleString()} in the circle — GoodCircles launch confirmed`,
      html:    wrap(body),
    });
    return !result.error;
  } catch {
    return false;
  }
}
