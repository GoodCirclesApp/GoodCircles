import { prisma } from './server/src/lib/prisma';



async function checkSeeding() {
  try {
    const tiers = await prisma.referralBonusTier.findMany();
    console.log('Referral Tiers in DB:', tiers.length);
    if (tiers.length > 0) {
      console.log('Tiers:', tiers.map(t => t.tierName).join(', '));
    } else {
      console.log('No tiers found. Seeding might have failed or not run yet.');
    }
  } catch (err) {
    console.error('Error checking tiers:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeeding();
