// =============================================================================
// GoodCircles AI Catalog Upload Tool — Receipt Email Template
// =============================================================================
// Generates HTML email receipts for catalog upload payments.
// Used by the notification system after successful payment and after
// import completion.
//
// Two templates:
//   1. Payment receipt (sent immediately after payment)
//   2. Import completion receipt (sent after products are published)
// =============================================================================

import type { CatalogTier, SourcePlatform } from '../types/catalog';
import { TIER_CONFIG } from '../types/catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentReceiptData {
  merchantName: string;
  merchantEmail: string;
  shopName: string;
  platform: SourcePlatform;
  tier: CatalogTier;
  productCount: number;
  amountPaid: number;     // In dollars
  transactionId: string;  // Stripe payment intent ID
  importJobId: string;
  paidAt: Date;
}

interface CompletionReceiptData {
  merchantName: string;
  merchantEmail: string;
  shopName: string;
  platform: SourcePlatform;
  tier: CatalogTier;
  totalProducts: number;
  publishedProducts: number;
  rejectedProducts: number;
  amountPaid: number;
  transactionId: string;
  storefrontUrl: string;
  completedAt: Date;
}

// ---------------------------------------------------------------------------
// Shared Styles
// ---------------------------------------------------------------------------

const STYLES = {
  container: 'font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;',
  header: 'background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px 24px; text-align: center; border-radius: 16px 16px 0 0;',
  headerTitle: 'color: #ffffff; font-size: 24px; font-weight: bold; margin: 0 0 4px 0;',
  headerSubtitle: 'color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;',
  body: 'padding: 24px;',
  section: 'margin-bottom: 24px;',
  sectionTitle: 'font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;',
  row: 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;',
  label: 'color: #6b7280; font-size: 14px;',
  value: 'color: #111827; font-size: 14px; font-weight: 500;',
  total: 'font-size: 18px; font-weight: 700; color: #111827;',
  badge: 'display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;',
  button: 'display: inline-block; padding: 12px 32px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;',
  footer: 'padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;',
  footerText: 'color: #9ca3af; font-size: 12px; margin: 0;',
};

// ---------------------------------------------------------------------------
// Payment Receipt Template
// ---------------------------------------------------------------------------

export function generatePaymentReceipt(data: PaymentReceiptData): {
  subject: string;
  html: string;
} {
  const tierLabel = data.tier.charAt(0) + data.tier.slice(1).toLowerCase();
  const dateStr = data.paidAt.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const subject = `GoodCircles Receipt — Catalog Import (${tierLabel})`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin: 0; padding: 16px; background: #f9fafb;">
  <div style="${STYLES.container}">
    <!-- Header -->
    <div style="${STYLES.header}">
      <h1 style="${STYLES.headerTitle}">Payment Received</h1>
      <p style="${STYLES.headerSubtitle}">Catalog Import — ${tierLabel} Plan</p>
    </div>

    <!-- Body -->
    <div style="${STYLES.body}">
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Hi ${data.merchantName},<br><br>
        Your payment for the GoodCircles Catalog Import has been confirmed.
        We are now importing your ${data.productCount.toLocaleString()} products from
        ${data.shopName} and optimizing them with AI for the community marketplace.
      </p>

      <!-- Order Details -->
      <div style="${STYLES.section}">
        <div style="${STYLES.sectionTitle}">Order Details</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Plan</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${tierLabel}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Source</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${data.shopName} (${data.platform})</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Products</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${data.productCount.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Per Product</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">$${(data.amountPaid / data.productCount).toFixed(2)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Date</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 14px 0; font-size: 16px; font-weight: 700; color: #111827;">Total Paid</td>
            <td style="padding: 14px 0; font-size: 20px; font-weight: 700; color: #7c3aed; text-align: right;">$${data.amountPaid.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- What's Next -->
      <div style="background: #f5f3ff; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <p style="color: #5b21b6; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">What happens next?</p>
        <ol style="color: #6d28d9; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>We fetch all your products from ${data.platform}</li>
          <li>AI optimizes descriptions and suggests community pricing</li>
          <li>You review and edit each product</li>
          <li>Publish to your GoodCircles storefront</li>
        </ol>
        <p style="color: #7c3aed; font-size: 12px; margin: 12px 0 0 0;">
          You will receive an email when your products are ready for review.
        </p>
      </div>

      <!-- Transaction ID -->
      <p style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">
        Transaction ID: ${data.transactionId}
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin-bottom: 0;">
        Import Job ID: ${data.importJobId}
      </p>
    </div>

    <!-- Footer -->
    <div style="${STYLES.footer}">
      <p style="${STYLES.footerText}">
        GoodCircles Community Marketplace<br>
        Questions? Reply to this email or contact support@goodcircles.app
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

// ---------------------------------------------------------------------------
// Import Completion Receipt Template
// ---------------------------------------------------------------------------

export function generateCompletionReceipt(data: CompletionReceiptData): {
  subject: string;
  html: string;
} {
  const dateStr = data.completedAt.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const subject = `Your GoodCircles Storefront Is Live! (${data.publishedProducts} products)`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin: 0; padding: 16px; background: #f9fafb;">
  <div style="${STYLES.container}">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="${STYLES.headerTitle}">Your Storefront Is Live!</h1>
      <p style="${STYLES.headerSubtitle}">${data.publishedProducts} products published to GoodCircles</p>
    </div>

    <!-- Body -->
    <div style="${STYLES.body}">
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Hi ${data.merchantName},<br><br>
        Great news! Your catalog import from ${data.shopName} is complete.
        ${data.publishedProducts} AI-optimized products are now live on your
        GoodCircles storefront and visible to your community.
      </p>

      <!-- Summary -->
      <div style="${STYLES.section}">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Published</td>
            <td style="padding: 10px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${data.publishedProducts} products</td>
          </tr>
          ${data.rejectedProducts > 0 ? `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Skipped</td>
            <td style="padding: 10px 0; color: #9ca3af; font-size: 14px; text-align: right;">${data.rejectedProducts} products</td>
          </tr>` : ''}
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Source</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${data.shopName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Completed</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${dateStr}</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.storefrontUrl}" style="${STYLES.button}">
          View Your Storefront
        </a>
      </div>

      <!-- Tips -->
      <div style="background: #fffbeb; padding: 16px; border-radius: 12px;">
        <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Tips for success:</p>
        <ul style="color: #a16207; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Share your storefront link with your community</li>
          <li>Review your pricing — you can adjust COGS and prices anytime from the Merchant Portal</li>
          <li>Select a nonprofit partner to receive donations from your sales</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="${STYLES.footer}">
      <p style="${STYLES.footerText}">
        GoodCircles Community Marketplace<br>
        Questions? Reply to this email or contact support@goodcircles.app
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default {
  generatePaymentReceipt,
  generateCompletionReceipt,
};
