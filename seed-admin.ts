import { prisma } from './server/src/lib/prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@goodcircles.org';
  const password = process.env.ADMIN_PASSWORD;
  const role = 'PLATFORM';

  if (!password) {
    console.error('ERROR: ADMIN_PASSWORD environment variable is required.');
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: { passwordHash, role }
      });
      console.log('Admin user updated successfully.');
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName: 'System',
        lastName: 'Admin',
        isActive: true,
      },
    });

    console.log('Admin user created successfully:', user.email);
  } catch (error) {
    console.error('Failed to create admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
