import { prisma } from '../lib/prisma';

// IRS EO BMF (Exempt Organizations Business Master File) — four regional CSV files.
// Published monthly: https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
const IRS_BMF_URLS = [
  'https://www.irs.gov/pub/irs-soi/eo1.csv',
  'https://www.irs.gov/pub/irs-soi/eo2.csv',
  'https://www.irs.gov/pub/irs-soi/eo3.csv',
  'https://www.irs.gov/pub/irs-soi/eo4.csv',
];

// EO BMF fixed column order (IRS spec, 0-indexed)
const C_EIN = 0, C_NAME = 1, C_CITY = 4, C_STATE = 5;
const C_SUBSECTION = 8, C_DEDUCTIBILITY = 12, C_STATUS = 16;

const DEDUCTIBILITY_MAP: Record<string, string> = {
  '1': 'PC',      // Public Charity — contributions deductible
  '2': 'ND',      // Not deductible
  '4': 'TREATY',  // Deductible by treaty
};

// Strip non-digits, left-pad to 9 digits to match IRS storage format
function normalizeEin(raw: string): string {
  return raw.replace(/\D/g, '').padStart(9, '0');
}

// Handles quoted fields containing commas
function parseCsvRow(line: string): string[] {
  const cols: string[] = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  cols.push(cur.trim());
  return cols;
}

type BmfRecord = {
  ein: string;
  legalName: string;
  city: string | null;
  state: string | null;
  subsectionCode: string | null;
  deductibilityCode: string;
  isRevoked: boolean;
};

export class IrsVerificationService {

  static async checkNonprofit(ein: string): Promise<{
    verified: boolean;
    isRevoked: boolean;
    legalName: string | null;
    deductibilityCode: string | null;
    note: string;
  }> {
    const normalized = normalizeEin(ein);
    const record = await prisma.irsNonprofitRecord.findUnique({ where: { ein: normalized } });

    if (!record) {
      const lastSync = await prisma.irsSyncLog.findFirst({
        where: { status: 'SUCCESS' },
        orderBy: { syncDate: 'desc' },
      });
      const syncNote = lastSync
        ? `Last IRS sync: ${lastSync.syncDate.toISOString().split('T')[0]}.`
        : 'No IRS sync has completed yet — trigger a sync from the dashboard.';
      return {
        verified: false, isRevoked: false, legalName: null, deductibilityCode: null,
        note: `EIN not found in IRS records. ${syncNote}`,
      };
    }

    if (record.isRevoked) {
      return {
        verified: false, isRevoked: true,
        legalName: record.legalName, deductibilityCode: null,
        note: `This organization's tax-exempt status has been revoked. Donations cannot be directed here.`,
      };
    }

    const deductLabel = record.deductibilityCode === 'PC'
      ? 'Contributions are tax-deductible.'
      : record.deductibilityCode === 'TREATY'
        ? 'Contributions deductible by treaty.'
        : 'Contributions are not tax-deductible.';

    return {
      verified: true, isRevoked: false,
      legalName: record.legalName, deductibilityCode: record.deductibilityCode,
      note: `Organization is in good standing per IRS records. ${deductLabel}`,
    };
  }

  // Streams all 4 IRS EO BMF files and batch-upserts into the database.
  // Safe to call without awaiting — logs all results to IrsSyncLog.
  static async syncFromIrs(): Promise<{ success: boolean; message: string; recordsTotal?: number }> {
    const startedAt = Date.now();
    const logEntry = await prisma.irsSyncLog.create({
      data: { status: 'IN_PROGRESS', recordsTotal: 0, revokedCount: 0, newRecords: 0, updatedRecords: 0 },
    });

    let totalNew = 0, totalUpdated = 0, totalRevoked = 0;

    try {
      for (const url of IRS_BMF_URLS) {
        const result = await IrsVerificationService.processBmfFile(url);
        totalNew += result.newRecords;
        totalUpdated += result.updatedRecords;
        totalRevoked += result.revokedCount;
        console.log(`[IRS Sync] ${url.split('/').pop()}: +${result.newRecords} new, ${result.updatedRecords} updated, ${result.revokedCount} revoked`);
      }

      const totalRecords = totalNew + totalUpdated;
      await prisma.irsSyncLog.update({
        where: { id: logEntry.id },
        data: { status: 'SUCCESS', recordsTotal: totalRecords, newRecords: totalNew, updatedRecords: totalUpdated, revokedCount: totalRevoked },
      });

      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      const msg = `Synced ${totalRecords.toLocaleString()} IRS records in ${elapsed}s`;
      console.log(`[IRS Sync] ${msg}`);
      return { success: true, message: msg, recordsTotal: totalRecords };

    } catch (err: any) {
      console.error('[IRS Sync] Sync failed:', err.message);
      await prisma.irsSyncLog.update({
        where: { id: logEntry.id },
        data: { status: 'FAILED', error: String(err.message) },
      });
      return { success: false, message: err.message };
    }
  }

  private static async processBmfFile(url: string): Promise<{ newRecords: number; updatedRecords: number; revokedCount: number }> {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'GoodCircles/1.0 IRS Compliance Sync' },
    });
    if (!response.ok) throw new Error(`IRS BMF download failed: ${url} — HTTP ${response.status}`);
    if (!response.body) throw new Error(`No response body from ${url}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let lineBuffer = '';
    let isFirstLine = true;
    let newRecords = 0, updatedRecords = 0, revokedCount = 0;

    let createBatch: BmfRecord[] = [];
    let revokedEins: string[] = [];

    const flushCreates = async () => {
      if (!createBatch.length) return;
      const result = await prisma.irsNonprofitRecord.createMany({
        data: createBatch.map(r => ({ ...r, lastSyncedAt: new Date() })),
        skipDuplicates: true,
      });
      newRecords += result.count;
      createBatch = [];
    };

    const flushRevocations = async () => {
      if (!revokedEins.length) return;
      const result = await prisma.irsNonprofitRecord.updateMany({
        where: { ein: { in: revokedEins }, isRevoked: false },
        data: { isRevoked: true, lastSyncedAt: new Date() },
      });
      updatedRecords += result.count;
      revokedCount += result.count;
      revokedEins = [];
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      lineBuffer += decoder.decode(value, { stream: true });
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (isFirstLine) { isFirstLine = false; continue; }

        const cols = parseCsvRow(trimmed);
        if (cols.length < 17) continue;

        const ein = normalizeEin(cols[C_EIN]);
        if (ein === '000000000' || ein.length !== 9) continue;

        const legalName = cols[C_NAME] || `EIN ${ein}`;
        const city = cols[C_CITY] || null;
        const state = cols[C_STATE] || null;
        const subsectionCode = cols[C_SUBSECTION] || null;
        const deductibilityCode = DEDUCTIBILITY_MAP[cols[C_DEDUCTIBILITY]] ?? 'ND';
        // STATUS 01 = Unconditional Exemption, 02 = Conditional — both active
        const isRevoked = cols[C_STATUS] !== '01' && cols[C_STATUS] !== '02';

        if (isRevoked) {
          revokedEins.push(ein);
          if (revokedEins.length >= 500) await flushRevocations();
        } else {
          createBatch.push({ ein, legalName, city, state, subsectionCode, deductibilityCode, isRevoked: false });
          if (createBatch.length >= 500) await flushCreates();
        }
      }
    }

    await flushCreates();
    await flushRevocations();
    return { newRecords, updatedRecords, revokedCount };
  }

  // Seeds platform-registered nonprofits as an immediate fallback so EIN
  // lookups work before the first full IRS sync completes.
  static async seedFromPlatformNonprofits(): Promise<void> {
    const nonprofits = await prisma.nonprofit.findMany({ select: { ein: true, orgName: true } });
    let seeded = 0;
    for (const np of nonprofits) {
      if (!np.ein) continue;
      const normalized = normalizeEin(np.ein);
      await prisma.irsNonprofitRecord.upsert({
        where: { ein: normalized },
        update: { legalName: np.orgName, lastSyncedAt: new Date() },
        create: { ein: normalized, legalName: np.orgName, deductibilityCode: 'PC', isRevoked: false },
      });
      seeded++;
    }
    console.log(`[IRS Sync] Seeded ${seeded} platform nonprofits into verification table.`);
  }

  // Called at server startup: triggers a background sync if data is empty or stale (> 30 days).
  static async syncIfStale(): Promise<void> {
    const count = await prisma.irsNonprofitRecord.count();
    const lastSync = await prisma.irsSyncLog.findFirst({
      where: { status: 'SUCCESS' },
      orderBy: { syncDate: 'desc' },
    });

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const isStale = !lastSync || Date.now() - new Date(lastSync.syncDate).getTime() > thirtyDaysMs;

    if (count === 0 || isStale) {
      const reason = count === 0 ? 'IRS database empty' : 'IRS data stale (>30 days)';
      console.log(`[IRS Sync] ${reason} — starting background sync of IRS EO BMF...`);
      IrsVerificationService.syncFromIrs().catch(err =>
        console.error('[IRS Sync] Background sync error:', err)
      );
    } else {
      console.log(`[IRS Sync] ${count.toLocaleString()} records on file. Last sync: ${lastSync!.syncDate.toISOString().split('T')[0]}`);
    }
  }

  static async isSyncInProgress(): Promise<boolean> {
    const running = await prisma.irsSyncLog.findFirst({
      where: { status: 'IN_PROGRESS' },
    });
    return !!running;
  }

  static async getSyncStatus(): Promise<{
    inProgress: boolean;
    recordCount: number;
    lastSync: string | null;
    lastStatus: string | null;
  }> {
    const [recordCount, lastLog] = await Promise.all([
      prisma.irsNonprofitRecord.count(),
      prisma.irsSyncLog.findFirst({ orderBy: { syncDate: 'desc' } }),
    ]);
    return {
      inProgress: lastLog?.status === 'IN_PROGRESS',
      recordCount,
      lastSync: lastLog?.syncDate.toISOString() ?? null,
      lastStatus: lastLog?.status ?? null,
    };
  }

  static async getRecentSyncLogs(limit = 10) {
    return prisma.irsSyncLog.findMany({
      orderBy: { syncDate: 'desc' },
      take: limit,
    });
  }
}
