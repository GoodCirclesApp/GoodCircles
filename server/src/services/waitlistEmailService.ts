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

export interface WaitlistOverflowParams {
  email: string;
  role:  string;
}

export async function sendWaitlistOverflowEmail(params: WaitlistOverflowParams): Promise<boolean> {
  const { email, role } = params;
  const roleLabel = ROLE_LABELS[role] ?? role;

  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#1a1a1a;line-height:1.1;">
      You're on the interest list.
    </h1>
    <p style="margin:0 0 28px;font-size:16px;color:#555;">
      Our founding circle is currently full, but we didn't want to lose you.
      We've added you to the interest list as a <strong>${roleLabel}</strong> —
      and you'll be the first to know the moment a spot opens.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="background:#f8f5ff;border:2px solid ${B.purple};border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${B.purple};">
          What happens next
        </p>
        <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">
          When a spot opens, you'll receive a direct invitation with a link to claim your place in the founding circle.
          No action needed on your end — just watch your inbox.
        </p>
      </td></tr>
    </table>

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
      subject: `You're on the GoodCircles interest list`,
      html:    wrap(body),
    });
    return !result.error;
  } catch {
    return false;
  }
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
  const greeting    = firstName ? `Hi ${firstName},` : 'Welcome,';

  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#1a1a1a;line-height:1.1;">
      You're in the founding circle.
    </h1>
    <p style="margin:0 0 28px;font-size:16px;color:#555;line-height:1.6;">
      ${greeting} Your founding spot as a <strong style="color:#1a1a1a;">${roleLabel}</strong> is confirmed.
      When GoodCircles launches in September 2026, you'll be among the first through the door —
      with founding status that's yours permanently.
    </p>

    <!-- Invite code pill -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr><td style="background:#f8f5ff;border:2px solid ${accentColor};border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accentColor};">
          Your Founding Invite Code
        </p>
        <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:4px;color:#1a1a1a;font-family:monospace;">
          ${inviteCode}
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#888;line-height:1.5;">
          Keep this safe — it's your key to the marketplace at launch.<br/>
          Share it to bring others into the founding circle.
        </p>
      </td></tr>
    </table>

    <!-- Nudge to share -->
    <p style="margin:0 0 28px;font-size:13px;color:#888;text-align:center;font-style:italic;">
      The most powerful thing you can do right now? Tell one neighbor, one local business, or one nonprofit.
    </p>

    <!-- What's next -->
    <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1a1a1a;">What happens next</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0;font-size:14px;color:#333;">
            <strong style="color:${accentColor};">1.</strong>&nbsp; We're finishing the final features before launch — you'll be notified as we get closer.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0;font-size:14px;color:#333;">
            <strong style="color:${accentColor};">2.</strong>&nbsp; You'll receive an exclusive early-access email with your personalized sign-in link.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <p style="margin:0;font-size:14px;color:#333;">
            <strong style="color:${accentColor};">3.</strong>&nbsp; Your invite code <strong>${inviteCode}</strong> locks in your role and founding status at signup.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://www.goodcircles.org"
           style="display:inline-block;background:linear-gradient(135deg,${B.purple},${B.lavender});color:#fff;
                  font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;
                  text-decoration:none;padding:14px 36px;border-radius:50px;">
          Grow your Good Circle &rarr;
        </a>
      </td></tr>
    </table>
  `;

  try {
    const result = await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: `You're a founding member of GoodCircles — your spot is confirmed`,
      html:    wrap(body),
    });
    return !result.error;
  } catch {
    return false;
  }
}
