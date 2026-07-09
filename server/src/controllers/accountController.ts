import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

// DSAR / data-portability: returns the authenticated user's own data as a JSON
// download. Read-only and self-scoped (always keyed by req.user.id) — never
// returns another user's data, and passwordHash is explicitly excluded by the
// scalar `select`. Account deletion/erasure is a separate, destructive flow that
// must reconcile the CCV/tax retention hold and is intentionally NOT included here.
export const exportMyData = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        discountMode: true,
        electedNonprofitId: true,
        acceptedTermsVersion: true,
        termsAcceptedAt: true,
        // Own role-specific profiles + activity (the user's own data).
        merchant: true,
        nonprofit: true,
        cdfiPartner: true,
        wallet: true,
        transactions: { orderBy: { createdAt: 'desc' }, take: 2000 },
        credits: { take: 2000 },
        consumerBookings: { take: 2000 },
        donorProfile: true,
        walletTopUps: { take: 2000 },
      },
    });

    if (!user) return res.status(404).json({ error: 'Account not found' });

    // Include any waitlist/early-access records keyed by this account's email
    // (compliance audit G3) — waitlist rows are not FK-linked to User, so a
    // User-only export previously omitted this PII (email, name, election, votes).
    const waitlistEntries = user.email
      ? await prisma.waitlistEntry.findMany({
          where: { email: user.email },
          select: {
            id: true, email: true, firstName: true, role: true, zipCode: true,
            city: true, state: true, ein: true, electedNonprofitId: true,
            utmSource: true, utmCampaign: true, referrer: true,
            verifiedAt: true, createdAt: true,
            // ipHash is a one-way hash and verifyToken is a live credential — omit.
          },
        }).catch(() => [])
      : [];

    const payload = {
      exportedAt: new Date().toISOString(),
      notice:
        'This file contains the personal data Good Circles holds for your account. ' +
        'It excludes security credentials (your password is stored only as a one-way hash) ' +
        'and live tokens. To delete your account, use "Delete my account" in settings or ' +
        'POST /api/account/delete.',
      account: user,
      waitlist: waitlistEntries,
    };

    const filename = `goodcircles-data-export-${user.id}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (err: any) {
    logger.error('[account] data export failed', { requestId: (req as any).id, error: err?.message });
    res.status(500).json({ error: 'Could not generate your data export. Please try again.' });
  }
};

// Right-to-erasure (compliance audit G2). This is ANONYMIZE-IN-PLACE, not a hard
// delete: financial, tax, and CCV records (transactions, ledger entries, donation
// receipts) must be RETAINED for legal/tax obligations, so we scrub the directly-
// identifying PII on the User and any waitlist rows while leaving the (now
// de-identified) financial history intact and keyed to the same id. The account is
// deactivated so it can no longer authenticate. See DATA_PRACTICES.md for the
// retention rationale. Requires an explicit confirm flag to prevent accidents.
export const deleteMyAccount = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const confirm = (req.body && (req.body.confirm === true || req.body.confirm === 'DELETE'));
  if (!confirm) {
    return res.status(400).json({
      error: 'Confirmation required. Re-send with { "confirm": true } to permanently anonymize your account.',
    });
  }
  try {
    const userId = req.user.id;
    const existing = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!existing) return res.status(404).json({ error: 'Account not found' });

    const tombstoneEmail = `deleted-${userId}@deleted.invalid`;

    await prisma.$transaction(async (tx) => {
      // Scrub the account's direct identifiers and deactivate it. Financial records
      // (transactions/ledger/receipts) are intentionally NOT deleted — they are
      // de-identified by virtue of the User PII being removed, and retained per
      // tax/CCV obligations.
      await tx.user.update({
        where: { id: userId },
        data: {
          email: tombstoneEmail,
          firstName: 'Deleted',
          lastName: 'User',
          phone: null,
          address: null,
          isActive: false,
        },
      });

      // Scrub matching waitlist PII (email/name/geo/tracking + one-way ipHash and
      // any live verify token) so erasure is complete across non-FK-linked rows.
      if (existing.email) {
        await tx.waitlistEntry.updateMany({
          where: { email: existing.email },
          data: {
            email: tombstoneEmail,
            firstName: null,
            zipCode: null,
            city: null,
            ipHash: null,
            verifyToken: null,
            utmSource: null,
            utmCampaign: null,
            referrer: null,
          },
        });
      }
    });

    // Best-effort audit trail of the erasure (actor = the user themselves).
    await prisma.adminAuditLog
      .create({ data: { adminId: userId, action: 'ACCOUNT_ANONYMIZED', targetId: userId, detail: 'self-service DSR erasure' } })
      .catch(() => {});

    logger.info('[account] account anonymized', { requestId: (req as any).id, userId });
    return res.status(200).json({
      ok: true,
      message:
        'Your account has been anonymized and deactivated. De-identified financial records ' +
        'are retained where required by tax and program-compliance law.',
    });
  } catch (err: any) {
    logger.error('[account] account deletion failed', { requestId: (req as any).id, error: err?.message });
    return res.status(500).json({ error: 'Could not delete your account. Please try again or contact support.' });
  }
};
