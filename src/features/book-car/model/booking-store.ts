import type { Booking } from './types';

interface BookingState {
    currentBooking: Booking | null;
}

export const bookingStore: BookingState = {
    currentBooking: null,
};

export const bookingActions = {
    setBooking(booking: Booking): void {
        bookingStore.currentBooking = booking;
    },

    clearBooking(): void {
        bookingStore.currentBooking = null;
    },

    getBooking(): Booking | null {
        return bookingStore.currentBooking;
    },
};
