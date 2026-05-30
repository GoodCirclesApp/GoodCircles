import { Router } from 'express';
import { Resend } from 'resend';
import { sendEmail } from '../services/emailService';
import { handleDeliveryEvent } from '../services/emailCampaignService';
import * as ec from '../controllers/emailCampaignController';
import { authenticateToken, blockViewOnly } from '../middleware/authMiddleware';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET ?? '';

// ── Resend delivery webhook (UNAUTHENTICATED) ────────────────────────────────
// Raw body is registered for this path in server.ts (before express.json) so the
// Svix signature can be verified. Updates per-recipient delivery state. Must be
// declared BEFORE the authenticateToken middleware below.
// POST /api/email/webhook/resend
router.post('/webhook/resend', async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);

    if (WEBHOOK_SECRET) {
      try {
        const svixId        = req.headers['svix-id'] as string;
        const svixTimestamp = req.headers['svix-timestamp'] as string;
        const svixSignature = req.headers['svix-signature'] as string;
        if (svixId && svixTimestamp && svixSignature) {
          resend.webhooks.verify({
            payload:       rawBody,
            headers:       { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
            webhookSecret: WEBHOOK_SECRET,
          });
        }
      } catch (verifyErr) {
        console.warn('[EmailWebhook] signature verification failed (continuing):', verifyErr);
      }
    }

    let parsed: any = {};
    try { parsed = JSON.parse(rawBody); } catch { /* ignore */ }
    await handleDeliveryEvent(parsed);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[EmailWebhook] error:', err);
    // Always 200 so Resend does not enter a retry storm over our processing errors.
    res.status(200).json({ ok: true });
  }
});

// ── Public unsubscribe (no auth) — signed token from marketing footer ────────
// GET /api/email/unsubscribe?token=...
router.get('/unsubscribe', ec.getUnsubscribe);

// ── Everything below requires authentication ─────────────────────────────────
router.use(authenticateToken);

// Campaigns
router.get('/campaigns', ec.getCampaigns);
router.get('/campaigns/:id', ec.getCampaignDetail);
router.post('/campaigns', blockViewOnly, ec.postCampaign);
router.post('/campaigns/:id/send', blockViewOnly, ec.postSendCampaign);
router.post('/campaigns/test', blockViewOnly, ec.postTestSend);
router.post('/campaigns/preview', ec.postPreview);

// Templates
router.get('/templates', ec.getTemplates);
router.post('/templates', blockViewOnly, ec.postTemplate);
router.put('/templates/:id', blockViewOnly, ec.putTemplate);
router.delete('/templates/:id', blockViewOnly, ec.deleteTemplate);

// Attachment library
router.get('/attachments', ec.getAttachments);
router.post('/attachments', blockViewOnly, ec.postAttachment);
router.delete('/attachments/:id', blockViewOnly, ec.deleteAttachment);

// POST /api/email/send
// Body: { to, toName, subject, html }
// Ad-hoc single-recipient send (legacy admin compose). The richer campaign
// surface (templates, mass send, scheduling) is added in later epics.
router.post('/send', blockViewOnly, async (req, res) => {
  const { to, toName, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const success = await sendEmail({
    to,
    toName: toName || '',
    subject,
    html,
    meta: { type: 'INDIVIDUAL', triggerSource: 'ADMIN_COMPOSE', layoutVariant: 'MARKETING' },
  });

  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
