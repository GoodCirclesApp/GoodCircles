
import { useState, useCallback, useEffect } from 'react';
import { Booking, MerchantAvailability, User } from '../types';

export function useBookingStore(currentUser: User | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<MerchantAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMerchantSchedule = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'MERCHANT') return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/merchant/schedule');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch merchant schedule:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchConsumerBookings = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'NEIGHBOR') return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch consumer bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchAvailability = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'MERCHANT') return;
    try {
      const response = await fetch('/api/merchant/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  }, [currentUser]);

  const updateAvailability = useCallback(async (newAvailability: Partial<MerchantAvailability>[]) => {
    try {
      const response = await fetch('/api/merchant/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newAvailability }),
      });
      if (response.ok) {
        await fetchAvailability();
      }
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  }, [fetchAvailability]);

  const confirmBooking = useCallback(async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'PUT',
      });
      if (response.ok) {
        await fetchMerchantSchedule();
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  }, [fetchMerchantSchedule]);

  const completeBooking = useCallback(async (bookingId: string, paymentMethod: string = 'CARD') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchMerchantSchedule();
        return data.stripeUrl;
      }
    } catch (error) {
      console.error('Failed to complete booking:', error);
    }
  }, [fetchMerchantSchedule]);

  const cancelBooking = useCallback(async (bookingId: string, reason: string, paymentMethod: string = 'CARD') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, paymentMethod }),
      });
      if (response.ok) {
        if (currentUser?.role === 'MERCHANT') {
          await fetchMerchantSchedule();
        } else {
          await fetchConsumerBookings();
        }
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  }, [currentUser, fetchMerchantSchedule, fetchConsumerBookings]);

  useEffect(() => {
    if (currentUser?.role === 'MERCHANT') {
      fetchMerchantSchedule();
      fetchAvailability();
    } else if (currentUser?.role === 'NEIGHBOR') {
      fetchConsumerBookings();
    }
  }, [currentUser, fetchMerchantSchedule, fetchAvailability, fetchConsumerBookings]);

  return {
    bookings,
    availability,
    isLoading,
    updateAvailability,
    confirmBooking,
    completeBooking,
    cancelBooking,
    refreshSchedule: currentUser?.role === 'MERCHANT' ? fetchMerchantSchedule : fetchConsumerBookings,
  };
}
