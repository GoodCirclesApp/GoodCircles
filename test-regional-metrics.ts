
import { RegionalMetricsService } from './server/src/services/regionalMetricsService';
import { prisma } from './server/src/lib/prisma';

async function testAggregation() {
  console.log('Starting Regional Metrics Aggregation Test...');
  const period = new Date().toISOString().slice(0, 7);
  try {
    // Ensure at least one region exists
    let region = await prisma.region.findFirst();
    if (!region) {
      console.log('No region found, creating a default one...');
      region = await prisma.region.create({
        data: {
          name: 'Test Region',
          cityName: 'Test City',
          state: 'TS'
        }
      });
    }

    console.log(`Running aggregation for period: ${period} and region: ${region.name}`);
    const results = await RegionalMetricsService.runAggregation(period);
    console.log('Aggregation results:', JSON.stringify(results, null, 2));
    console.log('Regional Metrics Aggregation Test Successful!');
  } catch (error) {
    console.error('Regional Metrics Aggregation Test Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAggregation();
