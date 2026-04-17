import { prisma } from './server/src/lib/prisma';



async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Successfully connected to the database. Found', users.length, 'users.');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
