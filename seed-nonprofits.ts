import { prisma } from './server/src/lib/prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const NONPROFITS = [
  {
    email: 'info@communityfoodbank.org',
    firstName: 'Community',
    lastName: 'Food Bank',
    orgName: 'Community Food Bank',
    ein: '12-3456789',
    missionStatement: 'We eliminate hunger in our community by connecting people with nutritious food and creating pathways to self-sufficiency.',
  },
  {
    email: 'info@youthempowerment.org',
    firstName: 'Youth',
    lastName: 'Empowerment Alliance',
    orgName: 'Youth Empowerment Alliance',
    ein: '23-4567890',
    missionStatement: 'We provide mentorship, education, and opportunity to young people in underserved neighborhoods so every child can reach their full potential.',
  },
  {
    email: 'info@greencityfund.org',
    firstName: 'Green',
    lastName: 'City Fund',
    orgName: 'Green City Environmental Fund',
    ein: '34-5678901',
    missionStatement: 'We protect urban green spaces, champion sustainability, and build a cleaner, healthier city for current and future generations.',
  },
  {
    email: 'info@neighborhoodarts.org',
    firstName: 'Neighborhood',
    lastName: 'Arts Collective',
    orgName: 'Neighborhood Arts Collective',
    ein: '45-6789012',
    missionStatement: 'We make art accessible to everyone by funding free community programs, public murals, and creative education in local schools.',
  },
  {
    email: 'info@housingforward.org',
    firstName: 'Housing',
    lastName: 'Forward',
    orgName: 'Housing Forward',
    ein: '56-7890123',
    missionStatement: 'We work to end homelessness and housing insecurity through emergency shelter, transitional housing, and long-term support services.',
  },
];

async function main() {
  const defaultPassword = process.env.NONPROFIT_SEED_PASSWORD || 'GoodCircles2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  let created = 0;
  let skipped = 0;

  for (const np of NONPROFITS) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: np.email } });
      if (existing) {
        // Ensure nonprofit record is verified
        const npRecord = await prisma.nonprofit.findUnique({ where: { userId: existing.id } });
        if (npRecord && !npRecord.isVerified) {
          await prisma.nonprofit.update({
            where: { id: npRecord.id },
            data: { isVerified: true, verifiedAt: new Date() },
          });
          console.log(`✓ Verified existing nonprofit: ${np.orgName}`);
        } else {
          console.log(`→ Already exists, skipping: ${np.orgName}`);
        }
        skipped++;
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: np.email,
            passwordHash,
            role: 'NONPROFIT',
            firstName: np.firstName,
            lastName: np.lastName,
            isActive: true,
          },
        });

        await tx.nonprofit.create({
          data: {
            userId: user.id,
            orgName: np.orgName,
            ein: np.ein,
            missionStatement: np.missionStatement,
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
      });

      console.log(`✓ Created nonprofit: ${np.orgName}`);
      created++;
    } catch (err: any) {
      console.error(`✗ Failed to create ${np.orgName}: ${err.message}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped/existing: ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
