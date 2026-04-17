import { prisma } from './server/src/lib/prisma';
import { AvailabilityService } from './server/src/services/availabilityService';
import { BookingService } from './server/src/services/bookingService';
import { format, addDays, startOfDay } from 'date-fns';



async function testBookingFlow() {
  console.log('--- Starting Booking Flow Test ---');

  // 1. Setup: Create Merchant, Nonprofit, Consumer, and Service Listing
  const npUser = await prisma.user.create({
    data: {
      email: `np-booking-${Date.now()}@test.com`,
      passwordHash: 'hash',
      role: 'NONPROFIT',
      nonprofit: { create: { orgName: 'Booking NP', ein: `EIN-B-${Date.now()}`, stripeAccountId: `acct_np_${Date.now()}` } }
    },
    include: { nonprofit: true }
  });

  const mUser = await prisma.user.create({
    data: {
      email: `m-booking-${Date.now()}@test.com`,
      passwordHash: 'hash',
      role: 'MERCHANT',
      merchant: { create: { businessName: 'Booking Merchant', businessType: 'SERVICE', stripeAccountId: `acct_m_${Date.now()}` } }
    },
    include: { merchant: true }
  });

  const nUser = await prisma.user.create({
    data: {
      email: `n-booking-${Date.now()}@test.com`,
      passwordHash: 'hash',
      role: 'NEIGHBOR',
      electedNonprofitId: npUser.nonprofit!.id,
      wallet: { create: { balance: 1000 } }
    }
  });

  const listing = await prisma.productService.create({
    data: {
      merchantId: mUser.merchant!.id,
      name: 'Consultation',
      price: 100,
      type: 'SERVICE',
      category: 'CONSULTING'
    }
  });

  console.log('Setup complete.');

  // 2. Set Availability
  await AvailabilityService.setWeeklyAvailability(mUser.merchant!.id, [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }  // Friday
  ]);
  console.log('Availability set.');

  // 3. Check Availability for a Tuesday
  const testDate = format(addDays(startOfDay(new Date()), 7), 'yyyy-MM-dd'); // Next week
  // Ensure it's a weekday for the test
  const slots = await AvailabilityService.getAvailableSlots(listing.id, testDate);
  console.log(`Available slots for ${testDate}: ${slots.length}`);

  if (slots.length === 0) {
    console.log('No slots available, skipping booking test.');
    return;
  }

  // 4. Create Booking
  const booking = await BookingService.createBooking(listing.id, nUser.id, testDate, '10:00', 60);
  console.log(`Booking created: ${booking.id}, status: ${booking.status}`);

  // 5. Merchant Confirms
  const confirmed = await BookingService.confirmBooking(booking.id, mUser.merchant!.id);
  console.log(`Booking confirmed: ${confirmed.id}, status: ${confirmed.status}`);

  // 6. Complete Booking (Triggers Transaction)
  const { booking: completed, stripeUrl } = await BookingService.completeBooking(booking.id, mUser.merchant!.id, 'INTERNAL');
  console.log(`Booking completed: ${completed.id}, status: ${completed.status}, transactionId: ${completed.transactionId}, stripeUrl: ${stripeUrl}`);

  // 7. Verify Transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: completed.transactionId! }
  });
  console.log(`Transaction verified: ${transaction?.id}, grossAmount: ${transaction?.grossAmount}`);

  // 8. Test Conflict
  try {
    await BookingService.createBooking(listing.id, nUser.id, testDate, '10:30', 60);
    console.log('Error: Conflict not detected!');
  } catch (err: any) {
    console.log(`Conflict correctly detected: ${err.message}`);
  }

  // 9. Test Block
  const blockStart = new Date(testDate);
  blockStart.setHours(14, 0, 0);
  const blockEnd = new Date(testDate);
  blockEnd.setHours(16, 0, 0);
  await AvailabilityService.addBlock(mUser.merchant!.id, blockStart, blockEnd, 'Vacation');
  console.log('Block added.');

  const slotsAfterBlock = await AvailabilityService.getAvailableSlots(listing.id, testDate);
  const isBlockedSlotAvailable = slotsAfterBlock.includes('14:30');
  console.log(`Is 14:30 available after block? ${isBlockedSlotAvailable}`);

  // 10. Test Late Cancellation Fee
  console.log('--- Testing Late Cancellation Fee ---');
  // Use a time that is within availability (09:00-17:00) but in the future today
  const lateBooking = await BookingService.createBooking(listing.id, nUser.id, format(new Date(), 'yyyy-MM-dd'), '16:00', 60);
  await BookingService.confirmBooking(lateBooking.id, mUser.merchant!.id);
  const cancelledLate = await BookingService.cancelBooking(lateBooking.id, nUser.id, 'NEIGHBOR', 'Too late!', 'INTERNAL');
  console.log(`Late booking cancelled: ${cancelledLate.id}, status: ${cancelledLate.status}, transactionId: ${cancelledLate.transactionId}`);
  
  if (cancelledLate.transactionId) {
    const feeTransaction = await prisma.transaction.findUnique({ where: { id: cancelledLate.transactionId } });
    console.log(`Cancellation fee transaction: ${feeTransaction?.id}, amount: ${feeTransaction?.grossAmount}`);
  } else {
    console.log('Warning: No cancellation fee transaction found for late cancellation.');
  }

  console.log('--- Booking Flow Test Completed ---');
}

testBookingFlow().catch(console.error);
