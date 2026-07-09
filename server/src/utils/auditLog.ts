import { prisma } from '../lib/prisma';

/**
 * Actor-attributed audit trail for sensitive/financial mutations (compliance audit
 * D15). Best-effort by design — an audit write must never fail the underlying
 * operation — but it captures who did what to which target and when, closing the
 * gap where refunds and other money-moving actions left no who-did-it record.
 *
 * This is the shared entry point; adminController keeps its own local writer for
 * the 11 pre-existing admin actions. New financial call sites should use this.
 */
export async function writeAuditLog(
  actorId: string,
  action: string,
  targetId?: string,
  detail?: string,
): Promise<void> {
  await prisma.adminAuditLog
    .create({ data: { adminId: actorId, action, targetId, detail } })
    .catch((err) => {
      // Never throw — but do surface it so a silently-failing audit trail is visible.
      console.error(`[AuditLog] failed to record ${action} by ${actorId}:`, err);
    });
}
