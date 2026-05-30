import {
  wrap as layoutWrap,
  heading,
  button as layoutButton,
  dataTable,
  BRAND,
  FROM_ADDRESSES,
} from './emailLayoutService';
import {
  isSuppressed,
  recordSend,
  finalizeSend,
  recordSuppressedSkip,
} from './emailCampaignService';
import { transport, withLogo, type EmailAttachment } from './emailTransport';

export type { EmailAttachment };

const APP_URL = process.env.APP_URL || 'https://goodcircles.org';

// Brand tokens now live in the shared emailLayoutService; aliased so the existing
// transactional senders below keep using `B.*` unchanged.
const B = BRAND;

// Back-compat shims: the transactional senders below were written against the old
// local helpers. These delegate to the shared emailLayoutService so every send now
// uses the locked aesthetic (System B shell) + CID-embedded logo without rewriting
// each sender. Transactional mail uses the solid-rect button and the light footer.
const emailHeader = (title: string): string => heading(title);
const emailButton = (label: string, url: string): string => layoutButton(label, url, 'solid');
const emailTable = (rows: [string, string, string?][]): string => dataTable(rows);
const emailFooter = (extra?: string): string | undefined => extra;
function wrap(header: string, body: string, footerExtra?: string): string {
  return layoutWrap({ body: `${header}${body}`, footerVariant: 'TRANSACTIONAL', footerExtra });
}

// ── Core send function ────────────────────────────────────────────────────────

// When provided, the send is recorded as an EmailCampaign + EmailRecipient (for the
// unified dashboard + delivery tracking) and suppression is enforced. Automated
// triggers pass this; ad-hoc sends without it still work (back-compat).
export interface EmailSendMeta {
  triggerSource?: string;                          // e.g. REGISTRATION_MERCHANT
  type?: string;                                   // defaults to AUTOMATED
  userId?: string | null;
  layoutVariant?: 'TRANSACTIONAL' | 'MARKETING';
}

export async function sendEmail(options: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  meta?: EmailSendMeta;
}): Promise<boolean> {
  const from = options.from || FROM_ADDRESSES.transactional;
  const allAttachments = withLogo(options.attachments);

  // Path A — tracked send (automated triggers / anything passing meta).
  if (options.meta) {
    if (await isSuppressed(options.to)) {
      console.log(`[Email] Skipped suppressed address: ${options.to}`);
      const ids = await recordSend({
        ...metaToRecord(options, from),
      });
      if (ids) await recordSuppressedSkip(ids);
      return true;
    }
    const ids = await recordSend(metaToRecord(options, from));
    const result = await transport(from, options, allAttachments);
    if (ids) await finalizeSend(ids, { ok: result.ok, resendId: result.id, error: result.error });
    return result.ok;
  }

  // Path B — untracked ad-hoc send (back-compat).
  const result = await transport(from, options, allAttachments);
  return result.ok;
}

function metaToRecord(
  options: { to: string; toName: string; subject: string; html: string; meta?: EmailSendMeta },
  from: string,
) {
  return {
    triggerSource: options.meta?.triggerSource,
    type: options.meta?.type,
    fromAddress: from,
    subject: options.subject,
    bodyHtml: options.html,
    emailAddress: options.to,
    toName: options.toName,
    userId: options.meta?.userId ?? null,
    layoutVariant: options.meta?.layoutVariant,
  };
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
    meta: { triggerSource: 'REGISTRATION_MERCHANT', layoutVariant: 'TRANSACTIONAL' },
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
    meta: { triggerSource: 'REGISTRATION_NONPROFIT', layoutVariant: 'TRANSACTIONAL' },
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
    meta: { triggerSource: 'PURCHASE_RECEIPT', layoutVariant: 'TRANSACTIONAL' },
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
    meta: { triggerSource: 'MERCHANT_ORDER', layoutVariant: 'TRANSACTIONAL' },
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
    meta: { triggerSource: 'WALLET_TOPUP', layoutVariant: 'TRANSACTIONAL' },
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
    meta: { triggerSource: 'NONPROFIT_DIGEST', layoutVariant: 'TRANSACTIONAL' },
  });
}
