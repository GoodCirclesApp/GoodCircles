import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

export interface ErrorEntry {
  level?: 'error' | 'warn';
  message: string;
  stack?: string;
  source?: string; // e.g. "POST /api/checkout"
  statusCode?: number;
  requestId?: string;
  userId?: string;
  userRole?: string;
}

const MAX_MESSAGE = 2000;
const MAX_STACK = 8000;

export class ErrorLogService {
  // Best-effort capture. NEVER throws and NEVER blocks the request — if the DB is
  // unavailable (which may itself be the error), it degrades to the structured log.
  static record(entry: ErrorEntry): void {
    void prisma.errorLog
      .create({
        data: {
          level: entry.level ?? 'error',
          message: (entry.message ?? 'Unknown error').slice(0, MAX_MESSAGE),
          stack: entry.stack ? entry.stack.slice(0, MAX_STACK) : null,
          source: entry.source ?? null,
          statusCode: entry.statusCode ?? null,
          requestId: entry.requestId ?? null,
          userId: entry.userId ?? null,
          userRole: entry.userRole ?? null,
        },
      })
      .catch((err) => {
        // Don't recurse into record() — just note it in the console logs.
        logger.warn('[errorLog] failed to persist error', { detail: String(err?.message ?? err) });
      });
  }

  static async list(opts: { page?: number; limit?: number; resolved?: boolean; level?: string } = {}) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
    const where: { resolved?: boolean; level?: string } = {};
    if (typeof opts.resolved === 'boolean') where.resolved = opts.resolved;
    if (opts.level) where.level = opts.level;

    const [items, total, unresolved] = await Promise.all([
      prisma.errorLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.errorLog.count({ where }),
      prisma.errorLog.count({ where: { resolved: false } }),
    ]);

    return { items, total, unresolved, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  static async setResolved(id: string, resolved: boolean) {
    return prisma.errorLog.update({ where: { id }, data: { resolved } });
  }

  // Clear resolved rows (default) or everything.
  static async clear(all = false) {
    const where = all ? {} : { resolved: true };
    const { count } = await prisma.errorLog.deleteMany({ where });
    return count;
  }

  // Retention: drop rows older than `days` (called by a daily background task).
  static async pruneOlderThan(days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { count } = await prisma.errorLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
    return count;
  }
}
