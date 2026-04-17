// ═══════════════════════════════════════════════════
// GOOD CIRCLES WELCOME EMAIL SEQUENCE
// Automated onboarding emails for new signups
// Routes through backend via Resend
// ═══════════════════════════════════════════════════

const BRAND = {
  purple: '#7851A9',
  gold: '#C2A76F',
  lavender: '#CA9CE1',
  crimson: '#A20021',
};

function emailWrapper(content: string): string {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:'Montserrat',Arial,sans-serif;color:#1A1A1A;">
      <div style="background:linear-gradient(135deg,${BRAND.purple} 0%,${BRAND.lavender} 100%);padding:32px;text-align:center;border-radius:16px 16px 0 0;">
        <h1 style="color:${BRAND.gold};font-size:28px;font-weight:800;margin:0;letter-spacing:2px;">GOOD CIRCLES</h1>
        <p style="color:white;font-size:12px;margin-top:8px;letter-spacing:3px;text-transform:uppercase;">Community Marketplace</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #E5E7EB;border-top:none;">
        ${content}
      </div>
      <div style="background:#F9FAFB;padding:24px;text-align:center;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 16px 16px;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">Good Circles &bull; Building community, one circle at a time.</p>
        <p style="color:#D1D5DB;font-size:10px;margin-top:8px;">You received this because you signed up at Good Circles. <a href="#" style="color:${BRAND.purple};">Unsubscribe</a></p>
      </div>
    </div>
  `;
}

function buttonHtml(text: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="background:${BRAND.purple};color:white;padding:14px 40px;border-radius:12px;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:1px;text-transform:uppercase;display:inline-block;">${text}</a>
  </div>`;
}

function highlightBox(text: string): string {
  return `<div style="background:${BRAND.purple}10;border-left:4px solid ${BRAND.purple};padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
    <p style="margin:0;font-size:14px;color:#374151;">${text}</p>
  </div>`;
}

function statRow(stats: { label: string; value: string }[]): string {
  return `<div style="display:flex;justify-content:space-around;margin:24px 0;text-align:center;">
    ${stats.map(s => `<div style="flex:1;">
      <div style="font-size:28px;font-weight:800;color:${BRAND.purple};">${s.value}</div>
      <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">${s.label}</div>
    </div>`).join('')}
  </div>`;
}

export interface EmailContent {
  subject: string;
  body: string;
}

function getWelcomeEmail(name: string, role: string, appUrl: string): EmailContent {
  const roleMessages: Record<string, string> = {
    NEIGHBOR: "As a member, you'll save 10% on every purchase while supporting local nonprofits — automatically.",
    MERCHANT: "As a merchant, you'll reach conscious consumers who value local businesses, with the lowest platform fee in the industry (just 1%).",
    NONPROFIT: "As a nonprofit partner, you'll receive automated funding from every purchase where a consumer selects your organization — no fundraising required.",
    PLATFORM: "You have full administrative access to the Good Circles platform.",
  };

  return {
    subject: `Welcome to Good Circles, ${name}!`,
    body: emailWrapper(`
      <h2 style="font-size:22px;font-weight:800;margin:0 0 16px 0;color:${BRAND.purple};">Welcome to the Circle, ${name}!</h2>
      <p style="font-size:15px;line-height:1.7;color:#4B5563;">You've just joined a marketplace that's changing how communities shop, sell, and give.</p>
      ${highlightBox(roleMessages[role] || roleMessages.NEIGHBOR)}
      <h3 style="font-size:16px;font-weight:700;margin:24px 0 12px 0;color:${BRAND.purple};">How the 10/10/1 Model Works:</h3>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:12px;background:${BRAND.gold}15;border-radius:8px 8px 0 0;border-bottom:2px solid white;">
            <strong style="color:${BRAND.gold};font-size:20px;">10%</strong>
            <span style="color:#4B5563;font-size:13px;margin-left:8px;">Consumers save on every purchase</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;background:${BRAND.crimson}10;border-bottom:2px solid white;">
            <strong style="color:${BRAND.crimson};font-size:20px;">10%</strong>
            <span style="color:#4B5563;font-size:13px;margin-left:8px;">Of merchant profit goes to a nonprofit</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;background:${BRAND.purple}10;border-radius:0 0 8px 8px;">
            <strong style="color:${BRAND.purple};font-size:20px;">1%</strong>
            <span style="color:#4B5563;font-size:13px;margin-left:8px;">Platform fee — the lowest in the industry</span>
          </td>
        </tr>
      </table>
      ${buttonHtml('Start Exploring', appUrl)}
    `),
  };
}

function getGettingStartedEmail(name: string, role: string, appUrl: string): EmailContent {
  const steps: Record<string, string[]> = {
    NEIGHBOR: ["Browse marketplace", "Choose nonprofit", "Checkout", "Impact Dashboard"],
    MERCHANT: ["Profile", "Add Product", "Connect Stripe", "Financials"],
    NONPROFIT: ["Profile", "Referral code", "Track donations", "Analytics"],
  };
  return {
    subject: `Getting started, ${name}`,
    body: emailWrapper(`<p>First steps: ${steps[role]?.join(', ') || 'Explore the app'}</p>${buttonHtml('Dashboard', appUrl)}`),
  };
}

function getImpactEmail(name: string, role: string, appUrl: string): EmailContent {
  return {
    subject: `${name}, your impact`,
    body: emailWrapper(`<p>Every purchase counts.</p>${buttonHtml('Impact', appUrl)}`),
  };
}

function getCommunityEmail(name: string, role: string, appUrl: string): EmailContent {
  return {
    subject: `${name}, part of the circle`,
    body: emailWrapper(`<p>Join the community.</p>${buttonHtml('Community', appUrl)}`),
  };
}

interface ScheduledEmail {
  templateKey: string;
  delayMs: number;
  getContent: (name: string, role: string, appUrl: string) => EmailContent;
}

const WELCOME_SEQUENCE: ScheduledEmail[] = [
  { templateKey: 'welcome', delayMs: 0, getContent: getWelcomeEmail },
  { templateKey: 'gettingStarted', delayMs: 24 * 60 * 60 * 1000, getContent: getGettingStartedEmail },
  { templateKey: 'impact', delayMs: 3 * 24 * 60 * 60 * 1000, getContent: getImpactEmail },
  { templateKey: 'community', delayMs: 7 * 24 * 60 * 60 * 1000, getContent: getCommunityEmail },
];

function markEmailSent(userId: string, templateKey: string) {
  const sent = JSON.parse(localStorage.getItem('gc_email_sequence') || '{}');
  if (!sent[userId]) sent[userId] = [];
  sent[userId].push(templateKey);
  localStorage.setItem('gc_email_sequence', JSON.stringify(sent));
}

function hasEmailBeenSent(userId: string, templateKey: string): boolean {
  const sent = JSON.parse(localStorage.getItem('gc_email_sequence') || '{}');
  return (sent[userId] || []).includes(templateKey);
}

async function sendEmail(toEmail: string, toName: string, content: EmailContent): Promise<boolean> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, toName, subject: content.subject, html: content.body }),
    });
    return response.ok;
  } catch (error) {
    console.error('[Email] Error:', error);
    return false;
  }
}

export const WelcomeEmailService = {
  async startSequence(user: { id: string; email: string; firstName?: string; role: string }) {
    const appUrl = window.location.origin;
    const name = user.firstName || 'there';
    for (const step of WELCOME_SEQUENCE) {
      if (hasEmailBeenSent(user.id, step.templateKey)) continue;
      if (step.delayMs === 0) {
        const content = step.getContent(name, user.role, appUrl);
        if (await sendEmail(user.email, name, content)) markEmailSent(user.id, step.templateKey);
      }
    }
  }
};
