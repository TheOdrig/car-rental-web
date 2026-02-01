import type { BookingConfirmation } from './types';

interface BookingState {
    currentBooking: BookingConfirmation | null;
}

export const bookingStore: BookingState = {
    currentBooking: null,
};

export const bookingActions = {
    setBooking(booking: BookingConfirmation): void {
        bookingStore.currentBooking = booking;
    },

    clearBooking(): void {
        bookingStore.currentBooking = null;
    },

    getBooking(): BookingConfirmation | null {
        return bookingStore.currentBooking;
    },
};