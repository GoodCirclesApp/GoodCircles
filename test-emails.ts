/**
 * GoodCircles Email Test Script
 * Sends one of each email type to a target address for visual QA.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx EMAIL_TO=you@example.com npx tsx test-emails.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import {
  sendMerchantWelcomeEmail,
  sendNonprofitWelcomeEmail,
  sendMerchantOrderEmail,
  sendCustomerReceiptEmail,
  sendWalletTopUpEmail,
  sendNonprofitDailyDigest,
} from './server/src/services/emailService.js';

// ── Config ────────────────────────────────────────────────────────────────────

const TO   = process.env.EMAIL_TO;
const KEY  = process.env.RESEND_API_KEY;

if (!TO)  { console.error('❌  Set EMAIL_TO=your@email.com'); process.exit(1); }
if (!KEY) { console.error('❌  Set RESEND_API_KEY=re_xxx'); process.exit(1); }

// Force Resend to use the provided key even if the .env doesn't have it
process.env.RESEND_API_KEY = KEY;
process.env.APP_URL        = process.env.APP_URL || 'https://goodcircles.org';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function run(label: string, fn: () => Promise<boolean>) {
  process.stdout.write(`Sending: ${label} ... `);
  try {
    const ok = await fn();
    console.log(ok ? '✅  sent' : '❌  failed (Resend returned error)');
  } catch (e: any) {
    console.log(`❌  threw: ${e.message}`);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log(`\n🔵  GoodCircles Email Test — sending all types to: ${TO}\n`);

await run('Merchant Welcome', () =>
  sendMerchantWelcomeEmail({
    merchantEmail: TO!,
    businessName: 'The Harvest Table',
  })
);

await run('Nonprofit Welcome', () =>
  sendNonprofitWelcomeEmail({
    nonprofitEmail: TO!,
    orgName: 'Youth Scholars Fund',
  })
);

await run('Customer Purchase Receipt', () =>
  sendCustomerReceiptEmail({
    customerEmail: TO!,
    customerFirstName: 'Tim',
    merchantName: 'The Harvest Table',
    productName: 'Farm Fresh Veggie Box',
    quantity: 2,
    grossAmount: 45.00,
    discountAmount: 4.50,
    customerPaid: 40.50,
    nonprofitShare: 4.50,
    nonprofitName: 'Youth Scholars Fund',
    platformFee: 0.45,
    transactionId: 'test-txn-001',
  })
);

// Merchant Order — real math: MSRP $45, COGS $10, discount 10% of MSRP
// effectiveRevenue = $40.50, netProfit = $30.50
// nonprofitShare  = 10% of $30.50 = $3.05
// platformFee     = 1%  of $30.50 = $0.31
// merchantNet     = COGS + 89% of $30.50 = $10 + $27.15 = $37.15
await run('Merchant Order Notification', () =>
  sendMerchantOrderEmail({
    merchantEmail: TO!,
    merchantName: 'Marco',
    businessName: 'The Harvest Table',
    customerFirstName: 'Tim',
    customerLastName: 'Harrison',
    customerEmail: 'tim.harrison@example.com',
    paymentMethod: 'INTERNAL',
    productName: 'Farm Fresh Veggie Box',
    quantity: 2,
    grossAmount: 45.00,
    discountAmount: 4.50,
    customerPaid: 40.50,
    cogs: 10.00,
    netProfit: 30.50,
    nonprofitShare: 3.05,
    nonprofitName: 'Youth Scholars Fund',
    platformFee: 0.31,
    merchantNet: 37.15,
    fulfillmentMethod: 'In-Store Pickup',
    transactionId: 'test-txn-001',
  })
);

await run('Wallet Top-Up Confirmation', () =>
  sendWalletTopUpEmail({
    userEmail: TO!,
    firstName: 'Tim',
    amount: 100.00,
    newBalance: 247.83,
  })
);

await run('Nonprofit Daily Donation Digest', () =>
  sendNonprofitDailyDigest({
    nonprofitEmail: TO!,
    nonprofitName: 'Youth Scholars Fund',
    donationCount: 14,
    totalAmount: 127.40,
    topMerchants: [
      { businessName: 'The Harvest Table', amount: 48.20 },
      { businessName: 'Fix-It Local', amount: 31.75 },
      { businessName: 'TutorZone', amount: 22.00 },
      { businessName: 'Farm Fresh Co.', amount: 15.45 },
      { businessName: 'Justice Law', amount: 10.00 },
    ],
    monthTotal: 1843.60,
    yearTotal: 9217.80,
  })
);

console.log('\n✅  All done — check your inbox (and spam folder).\n');
