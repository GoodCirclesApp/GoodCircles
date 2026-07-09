import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  createCampaign,
  sendCampaign,
  testSend,
  previewCampaign,
  listCampaigns,
  getCampaign,
  verifyUnsubToken,
  applyUnsubscribe,
} from '../services/emailCampaignService';

// ── Campaigns ────────────────────────────────────────────────────────────────
export const postCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await createCampaign({ ...req.body, createdById: req.user?.id });
    // If the caller asked to send immediately and it isn't future-scheduled, send now.
    if (req.body.sendNow && !(campaign.scheduledFor && campaign.scheduledFor.getTime() > Date.now())) {
      const result = await sendCampaign(campaign.id);
      return res.json({ campaign, send: result });
    }
    res.json({ campaign });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query as { type?: string; status?: string };
    res.json({ campaigns: await listCampaigns({ type, status }) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignDetail = async (req: Request, res: Response) => {
  try {
    const campaign = await getCampaign(String(req.params.id));
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ campaign });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const postSendCampaign = async (req: Request, res: Response) => {
  try {
    const result = await sendCampaign(String(req.params.id));
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const postTestSend = async (req: AuthRequest, res: Response) => {
  try {
    const to = req.body.to || req.user?.email;
    if (!to) return res.status(400).json({ error: 'No test recipient address' });
    const ok = await testSend(req.body, to);
    res.json({ ok, to });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const postPreview = async (req: Request, res: Response) => {
  try {
    res.json(await previewCampaign(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ── Templates ────────────────────────────────────────────────────────────────
export const getTemplates = async (_req: Request, res: Response) => {
  res.json({ templates: await prisma.emailTemplate.findMany({ where: { isActive: true }, orderBy: { updatedAt: 'desc' } }) });
};
export const postTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const t = await prisma.emailTemplate.create({ data: { ...req.body, createdById: req.user?.id } });
    res.json({ template: t });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
export const putTemplate = async (req: Request, res: Response) => {
  try {
    const t = await prisma.emailTemplate.update({ where: { id: String(req.params.id) }, data: req.body });
    res.json({ template: t });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    await prisma.emailTemplate.update({ where: { id: String(req.params.id) }, data: { isActive: false } });
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// ── Attachment library ─────────────────────────────────────────────────────────
// NOTE: binary upload to object storage (R2) is a P1 follow-up. For now the library
// stores attachment metadata + a storageUrl the admin supplies (e.g. an already-hosted file).
export const getAttachments = async (_req: Request, res: Response) => {
  res.json({ attachments: await prisma.emailAttachment.findMany({ where: { isLibraryItem: true }, orderBy: { createdAt: 'desc' } }) });
};
export const postAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { filename, contentType, sizeBytes, storageUrl } = req.body;
    if (!filename || !storageUrl) return res.status(400).json({ error: 'filename and storageUrl are required' });
    const a = await prisma.emailAttachment.create({
      data: { filename, contentType: contentType || 'application/octet-stream', sizeBytes: sizeBytes || 0, storageUrl, isLibraryItem: true, uploadedById: req.user?.id },
    });
    res.json({ attachment: a });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
export const deleteAttachment = async (req: Request, res: Response) => {
  try {
    await prisma.emailAttachment.delete({ where: { id: String(req.params.id) } });
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// ── Public unsubscribe (no auth) ──────────────────────────────────────────────
export const getUnsubscribe = async (req: Request, res: Response) => {
  const token = req.query.token as string;
  const email = verifyUnsubToken(token);
  if (!email) return res.status(400).send('<h1>Invalid or expired unsubscribe link.</h1>');
  await applyUnsubscribe(email, null);
  res.status(200).send(`<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;text-align:center;padding:60px;">
    <h1 style="color:#7851A9;">You're unsubscribed.</h1>
    <p style="color:#555;">${email} will no longer receive marketing email from Good Circles.</p>
    <p style="color:#999;font-size:13px;">You'll still receive essential transactional messages (receipts, account notices).</p>
  </body></html>`);
};

// RFC 8058 one-click unsubscribe target (compliance audit E4). Mailbox providers
// (Gmail/Yahoo) POST here with body `List-Unsubscribe=One-Click` when the user hits
// the native "Unsubscribe" affordance. Same signed token as the GET link; returns a
// bare 200 with no body (no user-facing page for the automated POST).
export const postUnsubscribe = async (req: Request, res: Response) => {
  const token = (req.query.token as string) || (req.body && (req.body.token as string));
  const email = verifyUnsubToken(token);
  if (!email) return res.status(400).json({ error: 'Invalid or expired unsubscribe link.' });
  await applyUnsubscribe(email, null);
  res.status(200).json({ ok: true });
};
