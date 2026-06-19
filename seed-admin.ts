import { prisma } from './server/src/lib/prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function upsertUser(
  email: string,
  password: string,
  role: 'PLATFORM' | 'PLATFORM_VIEWER',
  firstName: string,
  lastName: string,
) {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash, role, isActive: true } });
    console.log(`Updated ${role}: ${email}`);
  } else {
    await prisma.user.create({ data: { email, passwordHash, role, firstName, lastName, isActive: true } });
    console.log(`Created ${role}: ${email}`);
  }
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@goodcircles.org';
  const adminPassword = process.env.ADMIN_PASSWORD;
  const viewerEmail = process.env.VIEWER_EMAIL || 'viewer@goodcircles.org';
  // Reuse ADMIN_PASSWORD for the viewer unless a dedicated VIEWER_PASSWORD is set,
  // so provisioning both operating accounts needs only one secret.
  const viewerPassword = process.env.VIEWER_PASSWORD || adminPassword;

  if (!adminPassword) {
    console.error('ERROR: ADMIN_PASSWORD environment variable is required.');
    process.exit(1);
  }

  try {
    await upsertUser(adminEmail, adminPassword, 'PLATFORM', 'System', 'Admin');
    await upsertUser(viewerEmail, viewerPassword as string, 'PLATFORM_VIEWER', 'System', 'Viewer');
    console.log('Admin + viewer are ready — the only accounts a clean launch keeps.');
  } catch (error) {
    console.error('Failed to seed admin/viewer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
