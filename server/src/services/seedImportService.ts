// Boot-time Meridian seed sync (2026-07-06). Loads the curated CSVs committed
// at prisma/seed-data/ so the /meridian election dropdowns work on a fresh
// deploy AND pick up newly curated entries on later deploys.
// ADDITIVE-ONLY by design (createMany + skipDuplicates on the unique name):
// existing rows are never updated or deleted, so admin edits — deactivations,
// suggestion-promoted entries — are never clobbered, and a deactivated entry
// is never resurrected. For field updates/re-imports run
// scripts/import-seeds.mjs (idempotent upsert by name) manually.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { prisma } from '../lib/prisma';

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((f) => f.trim() !== '')) rows.push(row); }
  const [header, ...data] = rows;
  if (!header) return [];
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

export async function ensureMeridianSeeds(): Promise<void> {
  try {
    const dir = join(process.cwd(), 'prisma', 'seed-data');
    const npFile = join(dir, 'seed-meridian-nonprofits.csv');
    const bizFile = join(dir, 'seed-meridian-businesses.csv');

    if (existsSync(npFile)) {
      const rows = parseCsv(readFileSync(npFile, 'utf8')).filter((r) => r.name);
      const res = await prisma.seedNonprofit.createMany({
        data: rows.map((r) => ({
          name: r.name,
          category: r.category || 'other',
          city: r.city || 'Meridian',
          source: r.verified_source || null,
          notes: r.notes || null,
        })),
        skipDuplicates: true,
      });
      if (res.count > 0) console.log(`[Seeds] Added ${res.count} new Meridian nonprofit(s) from CSV (${rows.length} in file).`);
    }

    if (existsSync(bizFile)) {
      const rows = parseCsv(readFileSync(bizFile, 'utf8')).filter((r) => r.name);
      const res = await prisma.seedBusiness.createMany({
        data: rows.map((r) => ({
          name: r.name,
          category: r.category || 'other',
          area: r.area || null,
          ownershipType: r.ownership_type || null,
          source: r.verified_source || null,
          notes: r.notes || null,
        })),
        skipDuplicates: true,
      });
      if (res.count > 0) console.log(`[Seeds] Added ${res.count} new Meridian business(es) from CSV (${rows.length} in file).`);
    }
  } catch (err: any) {
    console.error('[Seeds] Meridian seed import error (non-fatal):', err.message);
  }
}
