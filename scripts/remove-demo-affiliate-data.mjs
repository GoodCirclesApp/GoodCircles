// One-off admin cleanup (2026-07-06): deactivate the demo affiliate program
// and its listings that the old unconditional boot seed created in production
// ("Amazon Associates" / tag goodcircles-20 + sample listings). DEACTIVATES
// (isActive=false) rather than deletes, so click/conversion history is
// preserved. Idempotent — safe to re-run.
//
// Usage:  DATABASE_URL=<prod-url> node scripts/remove-demo-affiliate-data.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoPrograms = await prisma.affiliateProgram.findMany({
  where: {
    OR: [
      { trackingId: 'goodcircles-20' },
      { trackingId: 'demo-00' },
      { name: { in: ['Amazon Associates', 'Amazon Associates (Demo)'] }, platform: 'AMAZON' },
    ],
  },
  select: { id: true, name: true, trackingId: true, isActive: true },
});

if (!demoPrograms.length) {
  console.log('No demo affiliate programs found — nothing to do.');
} else {
  for (const p of demoPrograms) {
    const listings = await prisma.affiliateListing.updateMany({
      where: { programId: p.id },
      data: { isActive: false },
    });
    await prisma.affiliateProgram.update({ where: { id: p.id }, data: { isActive: false } });
    console.log(`Deactivated program "${p.name}" (tag=${p.trackingId}) + ${listings.count} listing(s).`);
  }
  console.log('Done. History (clicks/conversions) preserved; nothing deleted.');
}
await prisma.$disconnect();
