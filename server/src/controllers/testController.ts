import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const saveReport = async (req: Request, res: Response) => {
  try {
    const { durationMs, totalTests, passed, failed, warnings, reportJson } = req.body;
    const adminId = (req as any).user?.id ?? 'unknown';

    const report = await prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "SystemTestReport" ("id", "runAt", "triggeredBy", "durationMs", "totalTests", "passed", "failed", "warnings", "reportJson")
       VALUES (gen_random_uuid(), NOW(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      adminId,
      durationMs,
      totalTests,
      passed,
      failed,
      warnings,
      JSON.stringify(reportJson),
    );

    res.json(report[0]);
  } catch (err: any) {
    console.error('[TestController] saveReport error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const listReports = async (_req: Request, res: Response) => {
  try {
    const reports = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "runAt", "triggeredBy", "durationMs", "totalTests", "passed", "failed", "warnings"
       FROM "SystemTestReport"
       ORDER BY "runAt" DESC
       LIMIT 50`,
    );
    res.json(reports);
  } catch (err: any) {
    console.error('[TestController] listReports error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "SystemTestReport" WHERE "id" = $1`,
      id,
    );
    if (!rows.length) return res.status(404).json({ error: 'Report not found' });
    const row = rows[0];
    row.reportJson = typeof row.reportJson === 'string' ? JSON.parse(row.reportJson) : row.reportJson;
    res.json(row);
  } catch (err: any) {
    console.error('[TestController] getReport error:', err);
    res.status(500).json({ error: err.message });
  }
};
