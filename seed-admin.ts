import { prisma } from './server/src/lib/prisma';
import bcrypt from 'bcryptjs';



async function main() {
  const email = 'admin@goodcircles.org';
  const password = 'Admin123';
  const role = 'PLATFORM'; // Assuming PLATFORM is the admin role based on adminController.ts

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
