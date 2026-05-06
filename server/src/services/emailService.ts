import { Resend } from 'resend';

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Good Circles <notifications@goodcircles.org>';
const APP_URL = process.env.APP_URL || 'https://goodcircles.org';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const B = {
  purple:   '#7851A9',
  gold:     '#C2A76F',
  lavender: '#CA9CE1',
  green:    '#059669',
  gray:     '#6B7280',
  lightBg:  '#F9FAFB',
  border:   '#E5E7EB',
  purpleBg: '#F0EBFF',
};

// ── Shared layout helpers ─────────────────────────────────────────────────────

function emailHeader(title: string): string {
  // Logo is served from the app's static files (public/logos/ → dist/logos/).
  // APP_URL must be set in Railway env vars to the live deployment URL.
  const logoUrl = `${APP_URL}/logos/logo-white-md.png`;

  return `
  <div style="background:linear-gradient(135deg,${B.purple} 0%,${B.lavender} 100%);padding:28px 32px 20px;text-align:center;border-radius:12px 12px 0 0;">
    <img src="${logoUrl}" alt="Good Circles" height="56" style="display:block;margin:0 auto 10px;" />
    <p style="color:rgba(255,255,255,0.75);font-size:11px;margin:0;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Community Marketplace</p>
  </div>
  <div style="background:${B.purple};padding:14px 32px;border-bottom:1px solid ${B.border};">
    <p style="margin:0;font-size:16px;font-weight:700;color:#fff;font-family:Arial,sans-serif;">${title}</p>
  </div>`;
}

function emailFooter(extra?: string): string {
  return `
  <div style="background:${B.lightBg};padding:24px 32px;text-align:center;border:1px solid ${B.border};border-top:none;border-radius:0 0 12px 12px;">
    ${extra ? `<p style="color:${B.gray};font-size:12px;margin:0 0 8px;">${extra}</p>` : ''}
    <p style="color:#9CA3AF;font-size:11px;margin:0;">Good Circles &bull; Building community, one circle at a time.</p>
    <p style="color:#D1D5DB;font-size:10px;margin:6px 0 0;">Questions? <a href="mailto:admin@goodcircles.org" style="color:${B.purple};text-decoration:none;">admin@goodcircles.org</a></p>
  </div>`;
}

function emailButton(label: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${url}" style="background:${B.purple};color:#fff;padding:13px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.5px;display:inline-block;font-family:Arial,sans-serif;">${label}</a>
  </div>`;
}

function emailTable(rows: [string, string, string?][]): string {
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    ${rows.map(([label, value, color], i) => `
    <tr style="background:${i % 2 === 0 ? B.lightBg : '#fff'};">
      <td style="padding:10px 14px;font-weight:600;color:#374151;width:48%;">${label}</td>
      <td style="padding:10px 14px;color:${color || '#111'};">${value}</td>
    </tr>`).join('')}
  </table>`;
}

function wrap(header: string, body: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:16px 0;background:#F3F4F6;font-family:Arial,'Helvetica Neue',sans-serif;">
  <div style="max-width:600px;margin:0 auto;">
    ${header}
    <div style="background:#fff;padding:32px;border:1px solid ${B.border};border-top:none;">
      ${body}
    </div>
    ${footer}
  </div>
</body>
</html>`;
}

// ── Core send function ────────────────────────────────────────────────────────

export async function sendEmail(options: {
  to: string;
  toName: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.group('[EMAIL SIMULATION] RESEND_API_KEY not configured');
    console.log(`To: ${options.toName} (${options.to})`);
    console.log(`Subject: ${options.subject}`);
    console.groupEnd();
    return true;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    });
    if (error) { console.error('[Email] Resend error:', error); return false; }
    console.log(`[Email] Sent successfully to ${options.to} — ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error('[Email] Unexpected error:', err);
    return false;
  }
}

// ── Merchant welcome ──────────────────────────────────────────────────────────

export async function sendMerchantWelcomeEmail(opts: {
  merchantEmail: string;
  businessName: string;
}): Promise<boolean> {
  const body = `
    <p style="font-size:15px;color:#374151;">Hi <strong>${opts.businessName}</strong>,</p>
    <p style="font-size:15px;color:#374151;line-height:1.7;">Your merchant account is live on Good Circles. Welcome to a marketplace built around community — where every sale you make also funds a local nonprofit.</p>

    <div style="background:${B.purpleBg};border-left:4px solid ${B.purple};padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
      <p style="margin:0;font-size:13px;font-weight:700;color:${B.purple};text-transform:uppercase;letter-spacing:0.5px;">The 10/10/1 Model</p>
      <table style="width:100%;margin-top:12px;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:${B.green};font-weight:700;width:36px;">10%</td><td style="padding:6px 0;color:#374151;">Customers save on every purchase — automatically</td></tr>
        <tr><td style="padding:6px 0;color:${B.purple};font-weight:700;">10%</td><td style="padding:6px 0;color:#374151;">Of your <strong>net profit</strong> goes to the customer's chosen nonprofit</td></tr>
        <tr><td style="padding:6px 0;color:${B.gray};font-weight:700;">1%</td><td style="padding:6px 0;color:#374151;">Platform fee — no subscriptions, no per-sale markups</td></tr>
      </table>
    </div>

    <p style="font-size:15px;color:#374151;font-weight:600;">What to do next:</p>
    <ul style="font-size:14px;color:#374151;line-height:1.9;padding-left:20px;">
      <li>Complete your merchant profile</li>
      <li>Add your products and services with pricing</li>
      <li>Set your availability and fulfillment options</li>
      <li>Connect Stripe to receive payouts</li>
    </ul>
    ${emailButton('Open Merchant Dashboard', APP_URL)}`;

  return sendEmail({
    to: opts.merchantEmail,
    toName: opts.businessName,
    subject: `Welcome to Good Circles, ${opts.businessName}!`,
    html: wrap(emailHeader('Welcome to Good Circles!'), body, emailFooter()),
  });
}

// ── Nonprofit welcome ─────────────────────────────────────────────────────────

export async function sendNonprofitWelcomeEmail(opts: {
  nonprofitEmail: string;
  orgName: string;
}): Promise<boolean> {
  const body = `
    <p style="font-size:15px;color:#374151;">Hi <strong>${opts.orgName}</strong>,</p>
    <p style="font-size:15px;color:#374151;line-height:1.7;">Your nonprofit account is now active on Good Circles. You're connected to a growing network of local merchants and community-minded consumers — and your funding grows automatically with every transaction that elects your organization.</p>

    <div style="background:${B.purpleBg};border-left:4px solid ${B.purple};padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
      <p style="margin:0;font-size:13px;font-weight:700;color:${B.purple};text-transform:uppercase;letter-spacing:0.5px;">How Your Funding Works</p>
      <ul style="font-size:14px;color:#374151;line-height:1.9;margin:12px 0 0;padding-left:18px;">
        <li><strong>Consumers</strong> elect your nonprofit as their impact partner when they shop</li>
        <li><strong>Merchants</strong> automatically donate <strong>10% of their net profit</strong> from each qualifying purchase to your organization</li>
        <li><strong>You receive</strong> those funds — tracked in real time, exportable for IRS reporting — with zero fundraising effort required</li>
      </ul>
    </div>

    <p style="font-size:14px;color:#374151;line-height:1.7;">Your dashboard gives you full visibility into donation history, donor profiles, merchant contributors, and cumulative totals by month and year. Export any date range as CSV for your IRS 990 or donor acknowledgement letters.</p>
    ${emailButton('View Nonprofit Dashboard', APP_URL)}`;

  return sendEmail({
    to: opts.nonprofitEmail,
    toName: opts.orgName,
    subject: `Welcome to Good Circles, ${opts.orgName}!`,
    html: wrap(emailHeader('Welcome to Good Circles!'), body, emailFooter()),
  });
}

// ── Customer purchase receipt ─────────────────────────────────────────────────

export async function sendCustomerReceiptEmail(opts: {
  customerEmail: string;
  customerFirstName: string;
  merchantName: string;
  productName: string;
  quantity: number;
  grossAmount: number;
  discountAmount: number;
  customerPaid: number;
  nonprofitShare: number;
  nonprofitName: string;
  platformFee: number;
  transactionId: string;
}): Promise<boolean> {
  const rows: [string, string, string?][] = [
    ['Merchant',            opts.merchantName],
    ['Item',                `${opts.productName} × ${opts.quantity}`],
    ['List Price',          `$${opts.grossAmount.toFixed(2)}`],
    ['Your 10% Discount',   `−$${opts.discountAmount.toFixed(2)}`, B.green],
    ['You Paid',            `$${opts.customerPaid.toFixed(2)}`],
    [`Donated to ${opts.nonprofitName}`, `$${opts.nonprofitShare.toFixed(2)}`, B.purple],
    ['Platform Fee',        `$${opts.platformFee.toFixed(2)}`, B.gray],
  ];

  const body = `
    <p style="font-size:15px;color:#374151;">Hi <strong>${opts.customerFirstName}</strong>, thank you for shopping local with Good Circles!</p>
    ${emailTable(rows)}
    <div style="background:${B.purpleBg};border-radius:8px;padding:16px 20px;margin:8px 0 24px;">
      <p style="margin:0;font-size:14px;color:${B.purple};line-height:1.6;">
        <strong>Community Impact:</strong> Your purchase just directed <strong>$${opts.nonprofitShare.toFixed(2)}</strong> to <strong>${opts.nonprofitName}</strong> — from the merchant's net profit, at no extra cost to you.
      </p>
    </div>
    <p style="font-size:12px;color:${B.gray};margin:0;">Transaction ID: ${opts.transactionId}</p>
    ${emailButton('View Your Impact', APP_URL)}`;

  return sendEmail({
    to: opts.customerEmail,
    toName: opts.customerFirstName,
    subject: `Receipt: ${opts.productName} from ${opts.merchantName}`,
    html: wrap(emailHeader('Your Purchase Receipt'), body, emailFooter()),
  });
}

// ── Merchant order notification ───────────────────────────────────────────────

export async function sendMerchantOrderEmail(opts: {
  merchantEmail: string;
  merchantName: string;
  businessName: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  paymentMethod: string;       // 'INTERNAL' | 'STRIPE' | 'CARD'
  productName: string;
  quantity: number;
  grossAmount: number;         // MSRP
  discountAmount: number;      // 10% of MSRP
  customerPaid: number;        // grossAmount − discountAmount − appliedCredits
  cogs: number;                // cost of goods
  netProfit: number;           // customerPaid − cogs
  nonprofitShare: number;      // 10% of netProfit
  nonprofitName: string;
  platformFee: number;         // 1% of netProfit
  merchantNet: number;         // cogs + 89% of netProfit
  fulfillmentMethod: string;
  bookingDate?: string;
  transactionId: string;
}): Promise<boolean> {
  const fulfillment = opts.bookingDate
    ? `${opts.fulfillmentMethod} — ${opts.bookingDate}`
    : opts.fulfillmentMethod;

  const paymentLabel =
    opts.paymentMethod === 'INTERNAL' ? 'Circle Wallet (internal)' :
    opts.paymentMethod === 'STRIPE'   ? 'Card (Stripe)' :
    opts.paymentMethod;

  const body = `
    <p style="font-size:15px;color:#374151;">Hi <strong>${opts.merchantName}</strong>, you have a new order through Good Circles.</p>

    <p style="font-size:13px;font-weight:700;color:${B.purple};text-transform:uppercase;letter-spacing:0.5px;margin:24px 0 8px;">Order Details</p>
    ${emailTable([
      ['Product / Service', `${opts.productName} × ${opts.quantity}`],
      ['Fulfillment',       fulfillment],
    ])}

    <p style="font-size:13px;font-weight:700;color:${B.purple};text-transform:uppercase;letter-spacing:0.5px;margin:24px 0 8px;">Customer</p>
    ${emailTable([
      ['Name',           `${opts.customerFirstName} ${opts.customerLastName}`],
      ['Email',          opts.customerEmail],
      ['Payment Method', paymentLabel],
    ])}

    <p style="font-size:13px;font-weight:700;color:${B.purple};text-transform:uppercase;letter-spacing:0.5px;margin:24px 0 8px;">Financial Summary</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px;">
      <tr style="background:${B.lightBg};">
        <td style="padding:10px 14px;color:#374151;width:60%;">List Price (MSRP)</td>
        <td style="padding:10px 14px;text-align:right;color:#111;">$${opts.grossAmount.toFixed(2)}</td>
      </tr>
      <tr style="background:#fff;">
        <td style="padding:10px 14px;color:${B.green};">Consumer 10% Discount</td>
        <td style="padding:10px 14px;text-align:right;color:${B.green};">−$${opts.discountAmount.toFixed(2)}</td>
      </tr>
      <tr style="background:${B.lightBg};font-weight:600;">
        <td style="padding:10px 14px;color:#374151;">Amount Received from Customer</td>
        <td style="padding:10px 14px;text-align:right;color:#111;">$${opts.customerPaid.toFixed(2)}</td>
      </tr>
      <tr style="background:#fff;">
        <td style="padding:10px 14px;color:#374151;">Cost of Goods (COGS)</td>
        <td style="padding:10px 14px;text-align:right;color:#374151;">−$${opts.cogs.toFixed(2)}</td>
      </tr>
      <tr style="background:${B.lightBg};font-weight:600;">
        <td style="padding:10px 14px;color:#374151;">Net Profit</td>
        <td style="padding:10px 14px;text-align:right;color:#111;">$${opts.netProfit.toFixed(2)}</td>
      </tr>
      <tr style="background:#fff;border-top:1px solid ${B.border};">
        <td style="padding:8px 14px 8px 24px;color:${B.purple};font-size:13px;">Nonprofit Donation (10% of Net) → ${opts.nonprofitName}</td>
        <td style="padding:8px 14px;text-align:right;color:${B.purple};font-size:13px;">−$${opts.nonprofitShare.toFixed(2)}</td>
      </tr>
      <tr style="background:${B.lightBg};">
        <td style="padding:8px 14px 8px 24px;color:${B.gray};font-size:13px;">Platform Fee (1% of Net)</td>
        <td style="padding:8px 14px;text-align:right;color:${B.gray};font-size:13px;">−$${opts.platformFee.toFixed(2)}</td>
      </tr>
      <tr style="background:${B.purpleBg};font-weight:700;font-size:15px;">
        <td style="padding:12px 14px;color:#111;">Your Net Earnings</td>
        <td style="padding:12px 14px;text-align:right;color:${B.green};">$${opts.merchantNet.toFixed(2)}</td>
      </tr>
    </table>

    <p style="font-size:12px;color:${B.gray};margin:0;">Transaction ID: ${opts.transactionId}</p>
    ${emailButton('View Merchant Dashboard', APP_URL)}`;

  return sendEmail({
    to: opts.merchantEmail,
    toName: opts.businessName,
    subject: `New Order: ${opts.productName} — $${opts.grossAmount.toFixed(2)}`,
    html: wrap(emailHeader('New Order Received'), body, emailFooter()),
  });
}

// ── Wallet top-up confirmation ────────────────────────────────────────────────

export async function sendWalletTopUpEmail(opts: {
  userEmail: string;
  firstName: string;
  amount: number;
  newBalance: number;
}): Promise<boolean> {
  const rows: [string, string, string?][] = [
    ['Amount Added',  `+$${opts.amount.toFixed(2)}`,    B.green],
    ['New Balance',   `$${opts.newBalance.toFixed(2)}`],
  ];

  const body = `
    <p style="font-size:15px;color:#374151;">Hi <strong>${opts.firstName}</strong>, your Circle Account has been topped up and is ready to use.</p>
    ${emailTable(rows)}
    <p style="font-size:14px;color:#374151;line-height:1.7;margin:16px 0;">Your funds work at any Good Circles merchant. Every purchase you make with your Circle Account automatically generates a donation — from the merchant's net profit — to your elected nonprofit, at no extra cost to you.</p>
    ${emailButton('Shop Now', APP_URL)}`;

  return sendEmail({
    to: opts.userEmail,
    toName: opts.firstName,
    subject: `$${opts.amount.toFixed(2)} added to your Circle Account`,
    html: wrap(emailHeader('Circle Account Funded'), body, emailFooter()),
  });
}

// ── Nonprofit daily donation digest ──────────────────────────────────────────

export async function sendNonprofitDailyDigest(opts: {
  nonprofitEmail: string;
  nonprofitName: string;
  donationCount: number;
  totalAmount: number;
  topMerchants: Array<{ businessName: string; amount: number }>;
  monthTotal: number;
  yearTotal: number;
}): Promise<boolean> {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const merchantRows = opts.topMerchants.map((m, i) => `
    <tr style="background:${i % 2 === 0 ? B.lightBg : '#fff'};">
      <td style="padding:8px 14px;font-size:13px;color:#374151;">${m.businessName}</td>
      <td style="padding:8px 14px;font-size:13px;color:${B.purple};font-weight:600;text-align:right;">$${m.amount.toFixed(2)}</td>
    </tr>`).join('');

  const summaryRows: [string, string, string?][] = [
    ['Donations Today',  `$${opts.totalAmount.toFixed(2)}`, B.purple],
    ['Transactions',     `${opts.donationCount}`],
    ['Month to Date',    `$${opts.monthTotal.toFixed(2)}`],
    ['Year to Date',     `$${opts.yearTotal.toFixed(2)}`],
  ];

  const merchantSection = merchantRows ? `
    <p style="font-size:14px;font-weight:700;color:#374151;margin:28px 0 8px;">Contributing Merchants Today</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid ${B.border};border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:${B.purpleBg};">
          <th style="padding:8px 14px;text-align:left;font-size:12px;color:${B.purple};text-transform:uppercase;letter-spacing:0.5px;">Merchant</th>
          <th style="padding:8px 14px;text-align:right;font-size:12px;color:${B.purple};text-transform:uppercase;letter-spacing:0.5px;">Donated</th>
        </tr>
      </thead>
      <tbody>${merchantRows}</tbody>
    </table>` : '';

  const body = `
    <p style="font-size:13px;color:${B.gray};margin:0 0 4px;">${dateStr}</p>
    <p style="font-size:15px;color:#374151;">Hi <strong>${opts.nonprofitName} team</strong>,</p>
    <p style="font-size:14px;color:#374151;line-height:1.7;">Here is your donation summary for the past 24 hours. All amounts reflect <strong>10% of merchant net profit</strong> from purchases where consumers elected your organization.</p>
    ${emailTable(summaryRows)}
    ${merchantSection}
    <div style="background:${B.purpleBg};border-radius:8px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;font-size:13px;color:${B.purple};line-height:1.6;">
        <strong>Tax &amp; Compliance:</strong> Full donor details, merchant records, and cumulative totals are available in your Nonprofit Dashboard under Donation Receipts. Export any date range as CSV for IRS 990 filings or donor acknowledgement letters.
      </p>
    </div>
    ${emailButton('Open Nonprofit Dashboard', APP_URL)}`;

  const footerNote = `You receive this digest because ${opts.nonprofitName} is a verified Good Circles nonprofit partner. Summaries are sent only on days when donations are received.`;

  return sendEmail({
    to: opts.nonprofitEmail,
    toName: opts.nonprofitName,
    subject: `Good Circles: $${opts.totalAmount.toFixed(2)} in donations today`,
    html: wrap(emailHeader('Daily Donation Summary'), body, emailFooter(footerNote)),
  });
}
