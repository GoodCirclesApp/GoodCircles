import { Resend } from 'resend';

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Good Circles <notifications@goodcircles.org>';
const APP_URL = process.env.APP_URL || 'https://goodcircles.org';

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

// ── Merchant order notification ───────────────────────────────────────────────
export async function sendMerchantOrderEmail(opts: {
  merchantEmail: string;
  merchantName: string;
  businessName: string;
  customerFirstName: string;
  productName: string;
  quantity: number;
  grossAmount: number;
  merchantNet: number;
  nonprofitShare: number;
  nonprofitName: string;
  fulfillmentMethod: string; // e.g. "In-Store Pickup", "Delivery", "Service Booking"
  bookingDate?: string;
  transactionId: string;
}): Promise<boolean> {
  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <div style="border-bottom:3px solid #7851A9;padding-bottom:16px;margin-bottom:24px">
    <img src="${APP_URL}/gc-logo.png" alt="Good Circles" height="36" style="margin-bottom:8px" />
    <h2 style="margin:0;font-size:20px">New Order Received</h2>
  </div>
  <p>Hi ${opts.merchantName}, you have a new order through Good Circles.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;font-weight:bold;width:40%">Product / Service</td><td style="padding:8px 12px">${opts.productName} × ${opts.quantity}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold">Customer</td><td style="padding:8px 12px">${opts.customerFirstName}</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;font-weight:bold">Fulfillment</td><td style="padding:8px 12px">${opts.fulfillmentMethod}${opts.bookingDate ? ' — ' + opts.bookingDate : ''}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold">Order Total</td><td style="padding:8px 12px">$${opts.grossAmount.toFixed(2)}</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;font-weight:bold">Your Net Earnings</td><td style="padding:8px 12px;color:#059669;font-weight:bold">$${opts.merchantNet.toFixed(2)}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold">Nonprofit Donation</td><td style="padding:8px 12px;color:#7851A9">$${opts.nonprofitShare.toFixed(2)} → ${opts.nonprofitName}</td></tr>
  </table>
  <p style="font-size:13px;color:#555">Transaction ID: ${opts.transactionId}</p>
  <a href="${APP_URL}" style="display:inline-block;margin-top:16px;background:#7851A9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View Merchant Dashboard</a>
  <p style="font-size:12px;color:#888;margin-top:32px">Good Circles — keeping money in your community.</p>
</body></html>`;
  return sendEmail({
    to: opts.merchantEmail,
    toName: opts.businessName,
    subject: `New Order: ${opts.productName} — $${opts.grossAmount.toFixed(2)}`,
    html,
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
  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <div style="border-bottom:3px solid #7851A9;padding-bottom:16px;margin-bottom:24px">
    <img src="${APP_URL}/gc-logo.png" alt="Good Circles" height="36" style="margin-bottom:8px" />
    <h2 style="margin:0;font-size:20px">Your Purchase Receipt</h2>
  </div>
  <p>Hi ${opts.customerFirstName}, thank you for shopping local with Good Circles!</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;font-weight:bold;width:50%">Merchant</td><td style="padding:8px 12px">${opts.merchantName}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold">Item</td><td style="padding:8px 12px">${opts.productName} × ${opts.quantity}</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;font-weight:bold">List Price</td><td style="padding:8px 12px">$${opts.grossAmount.toFixed(2)}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold;color:#059669">Your 10% Discount</td><td style="padding:8px 12px;color:#059669">−$${opts.discountAmount.toFixed(2)}</td></tr>
    <tr style="background:#f9f9f9;font-size:15px"><td style="padding:8px 12px;font-weight:bold">You Paid</td><td style="padding:8px 12px;font-weight:bold">$${opts.customerPaid.toFixed(2)}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold;color:#7851A9">Donation to ${opts.nonprofitName}</td><td style="padding:8px 12px;color:#7851A9">$${opts.nonprofitShare.toFixed(2)}</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;font-weight:bold">Platform Fee</td><td style="padding:8px 12px">$${opts.platformFee.toFixed(2)}</td></tr>
  </table>
  <div style="background:#f0ebff;border-radius:8px;padding:16px;margin:16px 0">
    <p style="margin:0;font-size:14px;color:#7851A9"><strong>Community Impact:</strong> Your purchase just sent $${opts.nonprofitShare.toFixed(2)} to ${opts.nonprofitName}. Every Good Circles purchase keeps money in your community.</p>
  </div>
  <p style="font-size:13px;color:#555">Transaction ID: ${opts.transactionId}</p>
  <a href="${APP_URL}" style="display:inline-block;margin-top:16px;background:#7851A9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View Your Impact</a>
  <p style="font-size:12px;color:#888;margin-top:32px">Good Circles — keeping money in your community.</p>
</body></html>`;
  return sendEmail({
    to: opts.customerEmail,
    toName: opts.customerFirstName,
    subject: `Receipt: ${opts.productName} from ${opts.merchantName}`,
    html,
  });
}

// ── Wallet top-up confirmation ────────────────────────────────────────────────
export async function sendWalletTopUpEmail(opts: {
  userEmail: string;
  firstName: string;
  amount: number;
  newBalance: number;
}): Promise<boolean> {
  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <div style="border-bottom:3px solid #7851A9;padding-bottom:16px;margin-bottom:24px">
    <img src="${APP_URL}/gc-logo.png" alt="Good Circles" height="36" style="margin-bottom:8px" />
    <h2 style="margin:0;font-size:20px">Wallet Funded</h2>
  </div>
  <p>Hi ${opts.firstName}, your Circle Account has been topped up.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;font-weight:bold;width:50%">Amount Added</td><td style="padding:8px 12px;font-weight:bold;color:#059669">+$${opts.amount.toFixed(2)}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold">New Balance</td><td style="padding:8px 12px;font-weight:bold">$${opts.newBalance.toFixed(2)}</td></tr>
  </table>
  <p>Your funds are ready to use at any Good Circles merchant — and every purchase generates a donation to your elected nonprofit.</p>
  <a href="${APP_URL}" style="display:inline-block;margin-top:16px;background:#7851A9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Shop Now</a>
  <p style="font-size:12px;color:#888;margin-top:32px">Good Circles — keeping money in your community.</p>
</body></html>`;
  return sendEmail({
    to: opts.userEmail,
    toName: opts.firstName,
    subject: `$${opts.amount.toFixed(2)} added to your Circle Account`,
    html,
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
  const merchantRows = opts.topMerchants.map(m =>
    `<tr><td style="padding:6px 12px">${m.businessName}</td><td style="padding:6px 12px;text-align:right">$${m.amount.toFixed(2)}</td></tr>`
  ).join('');

  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <div style="border-bottom:3px solid #7851A9;padding-bottom:16px;margin-bottom:24px">
    <img src="${APP_URL}/gc-logo.png" alt="Good Circles" height="36" style="margin-bottom:8px" />
    <h2 style="margin:0;font-size:20px">Daily Donation Summary</h2>
    <p style="margin:4px 0 0;font-size:13px;color:#555">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
  <p>Hi ${opts.nonprofitName} team,</p>
  <p>Here is your donation summary for the past 24 hours. Log in to your dashboard to view full donor details, export records, and update your DMS.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="background:#f0ebff"><td style="padding:10px 12px;font-weight:bold">Donations Today</td><td style="padding:10px 12px;font-weight:bold;font-size:18px;color:#7851A9;text-align:right">$${opts.totalAmount.toFixed(2)}</td></tr>
    <tr><td style="padding:8px 12px;color:#555">Transactions</td><td style="padding:8px 12px;text-align:right">${opts.donationCount}</td></tr>
    <tr style="background:#f9f9f9"><td style="padding:8px 12px;color:#555">Month to Date</td><td style="padding:8px 12px;text-align:right">$${opts.monthTotal.toFixed(2)}</td></tr>
    <tr><td style="padding:8px 12px;color:#555">Year to Date</td><td style="padding:8px 12px;text-align:right">$${opts.yearTotal.toFixed(2)}</td></tr>
  </table>
  ${merchantRows ? `
  <h3 style="font-size:15px;margin-top:24px">Contributing Merchants (Today)</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#f9f9f9"><th style="padding:6px 12px;text-align:left">Merchant</th><th style="padding:6px 12px;text-align:right">Donated</th></tr></thead>
    <tbody>${merchantRows}</tbody>
  </table>` : ''}
  <div style="background:#f0ebff;border-radius:8px;padding:16px;margin:24px 0">
    <p style="margin:0;font-size:13px;color:#7851A9"><strong>Tax & Compliance Note:</strong> All donation data, merchant details, and cumulative totals are available in your Nonprofit Dashboard under Donation Receipts. Export any date range as CSV for your IRS 990 or donor acknowledgement letters.</p>
  </div>
  <a href="${APP_URL}" style="display:inline-block;background:#7851A9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Open Nonprofit Dashboard</a>
  <p style="font-size:12px;color:#888;margin-top:32px">You receive this digest because ${opts.nonprofitName} is a verified Good Circles nonprofit partner. Daily summaries are sent only on days when donations are received.</p>
</body></html>`;
  return sendEmail({
    to: opts.nonprofitEmail,
    toName: opts.nonprofitName,
    subject: `Good Circles: $${opts.totalAmount.toFixed(2)} in donations today`,
    html,
  });
}
