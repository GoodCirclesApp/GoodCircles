import { prisma } from '../lib/prisma';

// CA Registry of Charitable Trusts bulk export.
// Set CA_AG_REGISTRY_URL in Railway env vars to the current download URL.
// Format: pipe-delimited CSV published by CA DOJ RCT.
// Columns (0-indexed): 0=RegistrationNumber, 1=OrgName, 2=AKA, 3=AccountType,
//   4=BridgeID, 5=AgencyDecision, 6=StatusDate, 7=RenewalDue, 8=State, 9=GovtAffil,
//   10=IssueDate, 11=EIN
// Status field (AgencyDecision): "Registered", "Delinquent", "Suspended", "Revoked", "Exempt"
const CA_AG_URL = process.env.CA_AG_REGISTRY_URL ??
  'https://rct.doj.ca.gov/Verification/Web/Search.aspx';

const DELINQUENT_STATUSES = new Set(['Delinquent', 'Suspended', 'Revoked', 'Inactive']);

function normalizeEin(raw: string): string {
  return raw.replace(/\D/g, '').padStart(9, '0');
}

function mapCaStatus(raw: string): string {
  const s = raw.trim();
  if (s === 'Registered' || s === 'Exempt') return 'ACTIVE';
  if (s === 'Delinquent') return 'DELINQUENT';
  if (s === 'Suspended') return 'SUSPENDED';
  if (s === 'Revoked') return 'REVOKED';
  return 'UNKNOWN';
}

export class StateStandingService {

  // Check a single EIN's state standing across all synced states.
  static async checkStanding(ein: string): Promise<{
    state: string;
    status: string;
    registrationNumber: string | null;
    lastSyncedAt: Date;
  }[]> {
    const normalized = normalizeEin(ein);
    return prisma.stateStandingRecord.findMany({
      where: { ein: normalized },
      select: { registrationState: true, status: true, registrationNumber: true, lastSyncedAt: true },
    }).then(rows => rows.map(r => ({
      state: r.registrationState,
      status: r.status,
      registrationNumber: r.registrationNumber,
      lastSyncedAt: r.lastSyncedAt,
    })));
  }

  // Ingest the California AG Registry CSV.
  // The CA DOJ file is pipe-delimited with a header row.
  // Configure CA_AG_REGISTRY_URL in env — see comment at top of file.
  static async syncCalifornia(): Promise<{ success: boolean; message: string }> {
    const logEntry = await prisma.stateStandingSyncLog.create({
      data: { state: 'CA', status: 'IN_PROGRESS' },
    });

    if (!process.env.CA_AG_REGISTRY_URL) {
      await prisma.stateStandingSyncLog.update({
        where: { id: logEntry.id },
        data: { status: 'FAILED', error: 'CA_AG_REGISTRY_URL env var not set' },
      });
      console.warn('[StateStanding] CA_AG_REGISTRY_URL not configured — skipping CA sync.');
      return { success: false, message: 'CA_AG_REGISTRY_URL not configured' };
    }

    try {
      const response = await fetch(CA_AG_URL, {
        headers: { 'User-Agent': 'GoodCircles/1.0 Compliance Sync' },
      });
      if (!response.ok) throw new Error(`CA AG download failed: HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body from CA AG registry');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let lineBuffer = '';
      let isFirstLine = true;
      let totalRecords = 0;
      let flaggedCount = 0;
      let batch: { ein: string; registrationState: string; legalName: string; registrationNumber: string; status: string }[] = [];

      const flush = async () => {
        if (!batch.length) return;
        for (const rec of batch) {
          await prisma.stateStandingRecord.upsert({
            where: { ein_registrationState: { ein: rec.ein, registrationState: rec.registrationState } },
            update: { legalName: rec.legalName, registrationNumber: rec.registrationNumber, status: rec.status, lastSyncedAt: new Date() },
            create: { ...rec, lastSyncedAt: new Date() },
          });
        }
        batch = [];
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

          // CA DOJ file is pipe-delimited
          const cols = trimmed.split('|');
          if (cols.length < 12) continue;

          const einRaw = cols[11]?.trim() ?? '';
          if (!einRaw) continue;
          const ein = normalizeEin(einRaw);
          if (ein === '000000000' || ein.length !== 9) continue;

          const registrationNumber = cols[0]?.trim() ?? '';
          const legalName = cols[1]?.trim() ?? '';
          const rawStatus = cols[5]?.trim() ?? '';
          const status = mapCaStatus(rawStatus);

          if (DELINQUENT_STATUSES.has(rawStatus)) flaggedCount++;
          totalRecords++;

          batch.push({ ein, registrationState: 'CA', legalName, registrationNumber, status });
          if (batch.length >= 500) await flush();
        }
      }
      await flush();

      // After sync, pause campaigns for delinquent/suspended nonprofits
      const paused = await StateStandingService.pauseCampaignsForBadStanding();
      if (paused > 0) {
        console.warn(`[StateStanding] Paused ${paused} campaign(s) due to CA AG delinquency.`);
      }

      await prisma.stateStandingSyncLog.update({
        where: { id: logEntry.id },
        data: { status: 'SUCCESS', recordsTotal: totalRecords, flaggedCount },
      });

      const msg = `CA AG sync: ${totalRecords.toLocaleString()} records, ${flaggedCount} flagged`;
      console.log(`[StateStanding] ${msg}`);
      return { success: true, message: msg };

    } catch (err: any) {
      await prisma.stateStandingSyncLog.update({
        where: { id: logEntry.id },
        data: { status: 'FAILED', error: String(err.message) },
      });
      console.error('[StateStanding] CA sync failed:', err.message);
      return { success: false, message: err.message };
    }
  }

  // After any state sync, pause active campaigns whose nonprofit
  // has a DELINQUENT or SUSPENDED status in any state the campaign operates in.
  static async pauseCampaignsForBadStanding(): Promise<number> {
    const badRecords = await prisma.stateStandingRecord.findMany({
      where: { status: { in: ['DELINQUENT', 'SUSPENDED', 'REVOKED'] } },
      select: { ein: true, registrationState: true },
    });
    if (!badRecords.length) return 0;

    const badEins = [...new Set(badRecords.map(r => r.ein))];

    // Find enrolled nonprofits with matching EINs
    const affectedNonprofits = await prisma.nonprofit.findMany({
      where: { ein: { in: badEins } },
      select: { id: true, ein: true, orgName: true },
    });
    if (!affectedNonprofits.length) return 0;

    const nonprofitIds = affectedNonprofits.map(np => np.id);

    const result = await prisma.ccvCampaign.updateMany({
      where: {
        nonprofitId: { in: nonprofitIds },
        campaignStatus: 'ACTIVE',
      },
      data: { campaignStatus: 'PAUSED', isActive: false },
    });

    for (const np of affectedNonprofits) {
      console.warn(`[StateStanding] PAUSED campaigns for ${np.orgName} (EIN ${np.ein}) — state standing issue.`);
    }

    return result.count;
  }

  static async getSyncStatus() {
    const [caLog, totalRecords] = await Promise.all([
      prisma.stateStandingSyncLog.findFirst({
        where: { state: 'CA' },
        orderBy: { syncDate: 'desc' },
      }),
      prisma.stateStandingRecord.count(),
    ]);
    return {
      recordCount: totalRecords,
      ca: {
        lastSync: caLog?.syncDate ?? null,
        lastStatus: caLog?.status ?? null,
        flaggedCount: caLog?.flaggedCount ?? 0,
      },
    };
  }

  static async syncIfStale(): Promise<void> {
    if (!process.env.CA_AG_REGISTRY_URL) return;

    const lastSync = await prisma.stateStandingSyncLog.findFirst({
      where: { state: 'CA', status: 'SUCCESS' },
      orderBy: { syncDate: 'desc' },
    });

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const isStale = !lastSync || Date.now() - new Date(lastSync.syncDate).getTime() > thirtyDaysMs;

    if (isStale) {
      console.log('[StateStanding] CA AG data stale — starting background sync...');
      StateStandingService.syncCalifornia().catch(err =>
        console.error('[StateStanding] Background sync error:', err)
      );
    }
  }
}
