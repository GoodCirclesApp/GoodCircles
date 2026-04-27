import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Omit columns that may not yet exist in the live DB (added to schema but not yet pushed).
// These are safe to omit globally — CDFI geocoding services access them directly via raw queries.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn'],
    omit: {
      merchant: {
        censusTractId: true,
        isQualifiedInvestmentArea: true,
        censusTractCheckedAt: true,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
