// =============================================================================
// GoodCircles AI Catalog Upload Tool — Merchant Notifications
// =============================================================================
// Email and in-app notifications for the catalog upload lifecycle:
//   1. Import started (with estimated completion time)
//   2. Products ready for review (with link to review step)
//   3. Storefront live (with link to storefront)
//   4. Import failed (with error details and next steps)
//
// Uses the existing GoodCircles email infrastructure (Resend).
// In-app toasts follow the CommunityActivityFeed pattern.
// =============================================================================

import type { SourcePlatform } from '../types/catalog';
import { generatePaymentReceipt, generateCompletionReceipt } from './catalogReceiptTemplate';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Resend (existing GoodCircles email service)
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = 'GoodCircles <noreply@goodcircles.app>';
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://goodcircles-production.up.railway.app';

// ---------------------------------------------------------------------------
// Email Helper
// ---------------------------------------------------------------------------

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[CatalogNotifications] Email send failed: ${response.status} — ${error}`);
    }
  } catch (err: any) {
    console.error(`[CatalogNotifications] Email send error: ${err.message}`);
    // Non-fatal: don't fail the import because an email didn't send
  }
}

// ---------------------------------------------------------------------------
// Notification: Import Started
// ---------------------------------------------------------------------------

export async function sendImportStartedEmail(data: {
  merchantEmail: string;
  merchantName: string;
  productCount: number;
  platform: SourcePlatform;
  estimatedMinutes: number;
}): Promise<void> {
  const subject = `Your catalog import is in progress (${data.productCount} products)`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin: 0; padding: 16px; background: #f9fafb; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Import In Progress</h1>
    </div>
    <div style="padding: 24px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Hi ${data.merchantName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        We're importing your <strong>${data.productCount.toLocaleString()}</strong> products from
        <strong>${data.platform}</strong> and optimizing them with AI for your GoodCircles storefront.
      </p>
      <div style="background: #f5f3ff; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <p style="color: #5b21b6; font-size: 14px; margin: 0;">
          Estimated completion: <strong>~${data.estimatedMinutes} minutes</strong>
        </p>
        <p style="color: #7c3aed; font-size: 12px; margin: 8px 0 0 0;">
          We'll email you as soon as your products are ready to review.
        </p>
      </div>
      <p style="color: #9ca3af; font-size: 12px;">
        No action needed right now — sit back and let AI do the work!
      </p>
    </div>
  </div>
</body>
</html>`;

  await sendEmail(data.merchantEmail, subject, html);
}

// ---------------------------------------------------------------------------
// Notification: Products Ready for Review
// ---------------------------------------------------------------------------

export async function sendReviewReadyEmail(data: {
  merchantEmail: string;
  merchantName: string;
  productCount: number;
  importId: string;
}): Promise<void> {
  const reviewUrl = `${APP_BASE_URL}/merchant/catalog-upload?job=${data.importId}&step=review`;
  const subject = `Your ${data.productCount} products are ready for review!`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin: 0; padding: 16px; background: #f9fafb; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Products Ready!</h1>
    </div>
    <div style="padding: 24px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Hi ${data.merchantName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Great news! Your <strong>${data.productCount.toLocaleString()}</strong> products have been imported and
        AI-optimized. Each product now has:
      </p>
      <ul style="color: #4b5563; font-size: 14px; line-height: 2;">
        <li>Community-focused descriptions</li>
        <li>Smart COGS and pricing suggestions</li>
        <li>Auto-mapped GoodCircles categories</li>
        <li>Quality flags for items needing attention</li>
      </ul>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${reviewUrl}"
           style="display: inline-block; padding: 14px 32px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Review Your Products
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        You can edit titles, descriptions, pricing, and categories before publishing.
      </p>
    </div>
  </div>
</body>
</html>`;

  await sendEmail(data.merchantEmail, subject, html);
}

// ---------------------------------------------------------------------------
// Notification: Storefront Live
// ---------------------------------------------------------------------------

export async function sendImportCompletedEmail(data: {
  merchantEmail: string;
  merchantName: string;
  shopName: string;
  platform: SourcePlatform;
  tier: string;
  totalProducts: number;
  publishedProducts: number;
  rejectedProducts: number;
  amountPaid: number;
  transactionId: string;
  storefrontUrl: string;
}): Promise<void> {
  const { subject, html } = generateCompletionReceipt({
    merchantName: data.merchantName,
    merchantEmail: data.merchantEmail,
    shopName: data.shopName,
    platform: data.platform,
    tier: data.tier as any,
    totalProducts: data.totalProducts,
    publishedProducts: data.publishedProducts,
    rejectedProducts: data.rejectedProducts,
    amountPaid: data.amountPaid,
    transactionId: data.transactionId,
    storefrontUrl: data.storefrontUrl,
    completedAt: new Date(),
  });

  await sendEmail(data.merchantEmail, subject, html);
}

// ---------------------------------------------------------------------------
// Notification: Import Failed
// ---------------------------------------------------------------------------

export async function sendImportFailedEmail(data: {
  merchantEmail: string;
  merchantName: string;
  importId: string;
  errorMessage: string;
  fetchedCount: number;
  totalCount: number;
}): Promise<void> {
  const resumeUrl = `${APP_BASE_URL}/merchant/catalog-upload?job=${data.importId}&action=resume`;
  const subject = `Issue with your catalog import — action needed`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin: 0; padding: 16px; background: #f9fafb; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Import Issue</h1>
    </div>
    <div style="padding: 24px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Hi ${data.merchantName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        We ran into an issue while importing your catalog. Here's what happened:
      </p>
      <div style="background: #fef2f2; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #ef4444;">
        <p style="color: #991b1b; font-size: 13px; margin: 0;">
          ${data.errorMessage}
        </p>
      </div>
      ${data.fetchedCount > 0 ? `
      <p style="color: #374151; font-size: 14px;">
        <strong>${data.fetchedCount} of ${data.totalCount}</strong> products were fetched before
        the error. Your progress has been saved — you can resume from where it stopped.
      </p>` : `
      <p style="color: #374151; font-size: 14px;">
        No products were fetched before the error. A full refund has been issued automatically.
      </p>`}
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resumeUrl}"
           style="display: inline-block; padding: 14px 32px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          ${data.fetchedCount > 0 ? 'Resume Import' : 'Try Again'}
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If this keeps happening, reply to this email and our team will help.
      </p>
    </div>
  </div>
</body>
</html>`;

  await sendEmail(data.merchantEmail, subject, html);
}

// ---------------------------------------------------------------------------
// In-App Toast Notifications
// ---------------------------------------------------------------------------
// These follow the CommunityActivityFeed pattern — positioned top-center on
// mobile. The frontend uses these as triggers via WebSocket or polling.
// ---------------------------------------------------------------------------

export interface InAppNotification {
  type: 'CATALOG_IMPORT_STARTED' | 'CATALOG_REVIEW_READY' | 'CATALOG_PUBLISHED' | 'CATALOG_FAILED';
  merchantId: string;
  title: string;
  message: string;
  actionUrl?: string;
  timestamp: Date;
}

export function createImportStartedToast(merchantId: string, productCount: number): InAppNotification {
  return {
    type: 'CATALOG_IMPORT_STARTED',
    merchantId,
    title: 'Catalog Import Started',
    message: `Importing ${productCount.toLocaleString()} products with AI optimization...`,
    timestamp: new Date(),
  };
}

export function createReviewReadyToast(merchantId: string, productCount: number, importId: string): InAppNotification {
  return {
    type: 'CATALOG_REVIEW_READY',
    merchantId,
    title: 'Products Ready for Review',
    message: `${productCount.toLocaleString()} AI-optimized products are ready for your review!`,
    actionUrl: `/merchant/catalog-upload?job=${importId}&step=review`,
    timestamp: new Date(),
  };
}

export function createPublishedToast(merchantId: string, publishedCount: number): InAppNotification {
  return {
    type: 'CATALOG_PUBLISHED',
    merchantId,
    title: 'Storefront Updated!',
    message: `${publishedCount.toLocaleString()} products are now live on your GoodCircles storefront.`,
    actionUrl: '/merchant/listings',
    timestamp: new Date(),
  };
}

export function createFailedToast(merchantId: string, importId: string): InAppNotification {
  return {
    type: 'CATALOG_FAILED',
    merchantId,
    title: 'Import Issue',
    message: 'There was a problem with your catalog import. Tap to see details.',
    actionUrl: `/merchant/catalog-upload?job=${importId}&action=resume`,
    timestamp: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default {
  sendImportStartedEmail,
  sendReviewReadyEmail,
  sendImportCompletedEmail,
  sendImportFailedEmail,
  createImportStartedToast,
  createReviewReadyToast,
  createPublishedToast,
  createFailedToast,
};
