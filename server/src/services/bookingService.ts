import { prisma } from '../lib/prisma';
import { AvailabilityService } from './availabilityService';
import { TransactionService } from './transactionService';
import { addHours, addDays, isBefore, subHours, startOfDay } from 'date-fns';



export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(listingId: string, consumerId: string, scheduledDate: string, scheduledTime: string, durationMinutes: number) {
    const listing = await prisma.productService.findUnique({
      where: { id: listingId },
      include: { merchant: true }
    });

    if (!listing || listing.type !== 'SERVICE') {
      throw new Error('Listing not found or is not a service');
    }

    const consumer = await prisma.user.findUnique({
      where: { id: consumerId },
      include: { electedNonprofit: true }
    });

    if (!consumer || !consumer.electedNonprofitId) {
      throw new Error('Consumer must have an elected nonprofit to book services');
    }

    const date = new Date(scheduledDate);
    const isAvailable = await AvailabilityService.isSlotAvailable(listing.merchantId, date, scheduledTime, durationMinutes);

    if (!isAvailable) {
      throw new Error('Selected time slot is not available');
    }

    const booking = await prisma.booking.create({
      data: {
        listingId,
        consumerId,
        merchantId: listing.merchantId,
        nonprofitId: consumer.electedNonprofitId,
        scheduledDate: date,
        scheduledTime,
        durationMinutes,
        status: 'PENDING'
      }
    });

    // Schedule reminders
    await this.scheduleReminders(booking.id, date, scheduledTime);

    return booking;
  }

  /**
   * Merchant confirms the booking
   */
  static async confirmBooking(bookingId: string, merchantId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.merchantId !== merchantId) {
      throw new Error('Booking not found or unauthorized');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is not in a pending state');
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' }
    });
  }

  /**
   * Complete service and trigger transaction
   */
  static async completeBooking(bookingId: string, merchantId: string, paymentMethod: string = 'STRIPE') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, consumer: true }
    });

    if (!booking || booking.merchantId !== merchantId) {
      throw new Error('Booking not found or unauthorized');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Booking must be confirmed before completion');
    }

    // Trigger transaction
    const result = await TransactionService.processTransaction({
      neighborId: booking.consumerId,
      merchantId: booking.merchantId,
      productServiceId: booking.listingId,
      nonprofitId: booking.nonprofitId,
      paymentMethod,
      discountWaived: false,
      discountMode: booking.consumer.discountMode as any || 'PRICE_REDUCTION',
      bookingId
    });

    // Determine new status
    const isPaid = paymentMethod === 'INTERNAL' || !result.stripeUrl;
    const newStatus = isPaid ? 'COMPLETED' : 'PAYMENT_PENDING';

    // Update booking with transaction ID and status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        transactionId: result.transaction.id
      }
    });

    return {
      booking: updatedBooking,
      stripeUrl: result.stripeUrl
    };
  }

  /**
   * Cancel booking with reason and optional fee
   */
  static async cancelBooking(bookingId: string, userId: string, role: string, reason: string, paymentMethod: string = 'STRIPE') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, consumer: true }
    });

    if (!booking) throw new Error('Booking not found');

    // Check authorization
    if (role === 'NEIGHBOR' && booking.consumerId !== userId) throw new Error('Unauthorized');
    if (role === 'MERCHANT' && booking.merchantId !== userId) throw new Error('Unauthorized');

    const now = new Date();
    const scheduledDateTime = new Date(booking.scheduledDate);
    const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes);

    const isLateCancellation = isBefore(subHours(scheduledDateTime, 24), now);

    let transactionId: string | undefined;

    if (isLateCancellation && role === 'NEIGHBOR' && booking.status === 'CONFIRMED') {
      // Charge 20% of the listing price as a cancellation fee
      const feeAmount = Number(booking.listing.price) * 0.2;
      
      console.log(`Late cancellation by consumer for booking ${bookingId}. Charging fee: ${feeAmount}`);
      
      try {
        // Process a transaction for the cancellation fee
        // We use a special payment method or flag to indicate it's a fee
        const result = await TransactionService.processTransaction({
          neighborId: booking.consumerId,
          merchantId: booking.merchantId,
          productServiceId: booking.listingId,
          nonprofitId: booking.nonprofitId,
          paymentMethod,
          discountWaived: true, // No discount on fees
          // We need to pass the fee amount to processTransaction
          // I'll update TransactionService to support an optional amount override
          amountOverride: feeAmount 
        });
        
        transactionId = result.transaction.id;
      } catch (error) {
        console.error('Failed to charge cancellation fee:', error);
        // We might still want to cancel the booking even if fee fails, 
        // or maybe we block cancellation if fee fails. 
        // For now, let's proceed with cancellation but log the error.
      }
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        transactionId: transactionId || booking.transactionId
      }
    });
  }

  /**
   * Schedule reminders for a booking
   */
  private static async scheduleReminders(bookingId: string, date: Date, time: string) {
    const scheduledDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes);

    const reminders = [
      { bookingId, remindAt: subHours(scheduledDateTime, 24), channel: 'EMAIL' },
      { bookingId, remindAt: subHours(scheduledDateTime, 1), channel: 'PUSH' }
    ];

    // Only schedule if remindAt is in the future
    const now = new Date();
    const futureReminders = reminders.filter(r => r.remindAt > now);

    if (futureReminders.length > 0) {
      for (const reminder of futureReminders) {
        await prisma.bookingReminder.create({
          data: reminder
        });
      }
    }
  }

  /**
   * Job to send pending reminders
   */
  static async processReminders() {
    const now = new Date();
    const pendingReminders = await prisma.bookingReminder.findMany({
      where: {
        sent: false,
        remindAt: { lte: now }
      },
      include: { booking: { include: { consumer: true, merchant: true } } }
    });

    for (const reminder of pendingReminders) {
      console.log(`Sending ${reminder.channel} reminder for booking ${reminder.bookingId} to ${reminder.booking.consumer.email}`);
      
      await prisma.bookingReminder.update({
        where: { id: reminder.id },
        data: { sent: true }
      });
    }

    return pendingReminders.length;
  }

  /**
   * Get upcoming bookings for a merchant
   */
  static async getMerchantSchedule(merchantId: string) {
    return prisma.booking.findMany({
      where: {
        merchantId,
        scheduledDate: { gte: startOfDay(new Date()) },
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: { listing: true, consumer: true },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' }
      ]
    });
  }
}
