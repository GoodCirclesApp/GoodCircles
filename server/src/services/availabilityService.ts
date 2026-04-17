import { prisma } from '../lib/prisma';
import { addMinutes, format, parse, startOfDay, endOfDay, isWithinInterval, addDays, getDay } from 'date-fns';



export class AvailabilityService {
  /**
   * Set weekly availability windows for a merchant
   */
  static async setWeeklyAvailability(merchantId: string, windows: { dayOfWeek: number, startTime: string, endTime: string }[]) {
    // Clear existing availability
    await prisma.merchantAvailability.deleteMany({
      where: { merchantId }
    });

    // Create new windows
    const createdWindows = [];
    for (const w of windows) {
      const created = await prisma.merchantAvailability.create({
        data: {
          merchantId,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
          isActive: true
        }
      });
      createdWindows.push(created);
    }
    return createdWindows;
  }

  /**
   * Add a one-off unavailable block
   */
  static async addBlock(merchantId: string, startDate: Date, endDate: Date, reason?: string) {
    return prisma.merchantBlock.create({
      data: {
        merchantId,
        startDate,
        endDate,
        reason
      }
    });
  }

  /**
   * Get available time slots for a specific listing on a specific date
   */
  static async getAvailableSlots(listingId: string, dateStr: string) {
    const listing = await prisma.productService.findUnique({
      where: { id: listingId },
      include: { merchant: true }
    });

    if (!listing || listing.type !== 'SERVICE') {
      throw new Error('Listing not found or is not a service');
    }

    const date = startOfDay(new Date(dateStr));
    const dayOfWeek = getDay(date);

    // 1. Get weekly availability for this day
    const availability = await prisma.merchantAvailability.findMany({
      where: {
        merchantId: listing.merchantId,
        dayOfWeek,
        isActive: true
      }
    });

    if (availability.length === 0) return [];

    // 2. Get existing bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        merchantId: listing.merchantId,
        scheduledDate: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        },
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
      }
    });

    // 3. Get blocks for this date
    const blocks = await prisma.merchantBlock.findMany({
      where: {
        merchantId: listing.merchantId,
        OR: [
          { startDate: { lte: endOfDay(date) }, endDate: { gte: startOfDay(date) } }
        ]
      }
    });

    const slots: string[] = [];
    const slotDuration = 30; // 30-minute increments

    for (const window of availability) {
      let current = parse(window.startTime, 'HH:mm', date);
      const end = parse(window.endTime, 'HH:mm', date);

      while (current < end) {
        const slotTime = format(current, 'HH:mm');
        const slotEnd = addMinutes(current, slotDuration);

        // Check if slot overlaps with any booking
        const isBooked = bookings.some(b => {
          const bStart = parse(b.scheduledTime, 'HH:mm', date);
          const bEnd = addMinutes(bStart, b.durationMinutes);
          return (current >= bStart && current < bEnd) || (slotEnd > bStart && slotEnd <= bEnd);
        });

        // Check if slot overlaps with any block
        const isBlocked = blocks.some(block => {
          return isWithinInterval(current, { start: block.startDate, end: block.endDate }) ||
                 isWithinInterval(slotEnd, { start: block.startDate, end: block.endDate });
        });

        if (!isBooked && !isBlocked) {
          slots.push(slotTime);
        }

        current = addMinutes(current, slotDuration);
      }
    }

    return slots;
  }

  /**
   * Check if a specific slot is available
   */
  static async isSlotAvailable(merchantId: string, date: Date, time: string, duration: number) {
    const dayOfWeek = getDay(date);
    const startTime = parse(time, 'HH:mm', date);
    const endTime = addMinutes(startTime, duration);

    // 1. Check weekly availability
    const availability = await prisma.merchantAvailability.findMany({
      where: { merchantId, dayOfWeek, isActive: true }
    });

    const inWindow = availability.some(window => {
      const wStart = parse(window.startTime, 'HH:mm', date);
      const wEnd = parse(window.endTime, 'HH:mm', date);
      return startTime >= wStart && endTime <= wEnd;
    });

    if (!inWindow) return false;

    // 2. Check bookings
    const bookings = await prisma.booking.findMany({
      where: {
        merchantId,
        scheduledDate: { gte: startOfDay(date), lte: endOfDay(date) },
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
      }
    });

    const hasBookingConflict = bookings.some(b => {
      const bStart = parse(b.scheduledTime, 'HH:mm', date);
      const bEnd = addMinutes(bStart, b.durationMinutes);
      return (startTime < bEnd && endTime > bStart);
    });

    if (hasBookingConflict) return false;

    // 3. Check blocks
    const blocks = await prisma.merchantBlock.findMany({
      where: {
        merchantId,
        OR: [
          { startDate: { lt: endTime }, endDate: { gt: startTime } }
        ]
      }
    });

    if (blocks.length > 0) return false;

    return true;
  }
}
