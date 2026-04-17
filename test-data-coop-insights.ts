
import { DataCoopService } from './server/src/services/dataCoopService';
import { prisma } from './server/src/lib/prisma';

async function testInsights() {
  console.log('Starting Data Coop Insight Generation Test...');
  try {
    // Ensure at least one member exists
    let member = await prisma.dataCoopMember.findFirst();
    if (!member) {
      console.log('No Data Coop member found, creating a default one...');
      // Need a merchant first
      let merchant = await prisma.merchant.findFirst();
      if (!merchant) {
          console.log('No merchant found, creating a default one...');
          const user = await prisma.user.create({
              data: {
                  email: `merchant_${Date.now()}@example.com`,
                  passwordHash: 'dummy',
                  role: 'MERCHANT',
                  firstName: 'Test',
                  lastName: 'Merchant'
              }
          });
          merchant = await prisma.merchant.create({
              data: {
                  userId: user.id,
                  businessName: 'Test Merchant',
                  businessType: 'GOODS'
              }
          });
      }
      member = await prisma.dataCoopMember.create({
        data: {
          merchantId: merchant.id,
        }
      });
    }

    console.log(`Running insight generation...`);
    await DataCoopService.generateInsights();
    console.log('Data Coop Insight Generation Test Successful!');
  } catch (error) {
    console.error('Data Coop Insight Generation Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInsights();
