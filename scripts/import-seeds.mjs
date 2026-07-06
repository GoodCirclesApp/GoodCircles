// Meridian early-access seed importer (2026-07-06).
// Loads the curated, verified Meridian/Lauderdale County seed lists into
// SeedNonprofit / SeedBusiness. IDEMPOTENT: matches on name (unique) and
// upserts — re-running never creates duplicates and never deletes rows.
// Corporate chains were excluded at curation time; locally-owned franchises
// are allowed (ownership_type column).
//
// Usage:
//   node scripts/import-seeds.mjs                     # repo copies in prisma/seed-data/
//   node scripts/import-seeds.mjs <nonprofits.csv> <businesses.csv>
// Requires DATABASE_URL (same as the server).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/quotes).
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
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
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const defaults = (name) => fileURLToPath(new URL(`../prisma/seed-data/${name}`, import.meta.url));
const npPath = process.argv[2] || defaults('seed-meridian-nonprofits.csv');
const bizPath = process.argv[3] || defaults('seed-meridian-businesses.csv');

const nonprofits = parseCsv(readFileSync(npPath, 'utf8'));
const businesses = parseCsv(readFileSync(bizPath, 'utf8'));

let npNew = 0, npUpd = 0, bzNew = 0, bzUpd = 0;
for (const r of nonprofits) {
  if (!r.name) continue;
  const data = {
    category: r.category || 'other',
    city: r.city || 'Meridian',
    source: r.verified_source || null,
    notes: r.notes || null,
  };
  const existing = await prisma.seedNonprofit.findUnique({ where: { name: r.name } });
  await prisma.seedNonprofit.upsert({ where: { name: r.name }, update: data, create: { name: r.name, ...data } });
  existing ? npUpd++ : npNew++;
}
for (const r of businesses) {
  if (!r.name) continue;
  const data = {
    category: r.category || 'other',
    area: r.area || null,
    ownershipType: r.ownership_type || null,
    source: r.verified_source || null,
    notes: r.notes || null,
  };
  const existing = await prisma.seedBusiness.findUnique({ where: { name: r.name } });
  await prisma.seedBusiness.upsert({ where: { name: r.name }, update: data, create: { name: r.name, ...data } });
  existing ? bzUpd++ : bzNew++;
}

const npTotal = await prisma.seedNonprofit.count();
const bzTotal = await prisma.seedBusiness.count();
console.log(`nonprofits: ${npNew} created, ${npUpd} updated → ${npTotal} total`);
console.log(`businesses: ${bzNew} created, ${bzUpd} updated → ${bzTotal} total`);
await prisma.$disconnect();
