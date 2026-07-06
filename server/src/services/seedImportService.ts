// Boot-time Meridian seed import (2026-07-06). If the seed tables are EMPTY,
// load the curated CSVs committed at prisma/seed-data/ so the /meridian
// election dropdowns work on a fresh deploy without a manual step.
// Conservative by design: runs ONLY when a table has zero rows, so it can
// never clobber admin edits (deactivations, approved suggestions). For
// updates/re-imports use scripts/import-seeds.mjs (idempotent upsert by name).
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

    if ((await prisma.seedNonprofit.count()) === 0 && existsSync(npFile)) {
      const rows = parseCsv(readFileSync(npFile, 'utf8')).filter((r) => r.name);
      await prisma.seedNonprofit.createMany({
        data: rows.map((r) => ({
          name: r.name,
          category: r.category || 'other',
          city: r.city || 'Meridian',
          source: r.verified_source || null,
          notes: r.notes || null,
        })),
        skipDuplicates: true,
      });
      console.log(`[Seeds] Imported ${rows.length} Meridian nonprofits (table was empty).`);
    }

    if ((await prisma.seedBusiness.count()) === 0 && existsSync(bizFile)) {
      const rows = parseCsv(readFileSync(bizFile, 'utf8')).filter((r) => r.name);
      await prisma.seedBusiness.createMany({
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
      console.log(`[Seeds] Imported ${rows.length} Meridian businesses (table was empty).`);
    }
  } catch (err: any) {
    console.error('[Seeds] Meridian seed import error (non-fatal):', err.message);
  }
}
