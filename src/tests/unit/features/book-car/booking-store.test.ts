import { describe, it, expect, beforeEach } from 'vitest';
import { bookingActions, bookingStore } from '@/features/book-car/model/booking-store';
import { createMockBooking } from './fixtures';

describe('Booking Store', () => {
    beforeEach(() => {
        bookingActions.clearBooking();
    });

    describe('setBooking', () => {
        it('should set current booking', () => {
            const mockBooking = createMockBooking();

            bookingActions.setBooking(mockBooking);

            expect(bookingStore.currentBooking).toEqual(mockBooking);
            expect(bookingActions.getBooking()).toEqual(mockBooking);
        });

        it('should replace existing booking', () => {
            const firstBooking = createMockBooking({ referenceNumber: 'BOOK-1' });
            const secondBooking = createMockBooking({ referenceNumber: 'BOOK-2' });

            bookingActions.setBooking(firstBooking);
            expect(bookingStore.currentBooking?.referenceNumber).toBe('BOOK-1');

            bookingActions.setBooking(secondBooking);
            expect(bookingStore.currentBooking?.referenceNumber).toBe('BOOK-2');
        });
    });

    describe('clearBooking', () => {
        it('should clear current booking', () => {
            const mockBooking = createMockBooking();
            bookingActions.setBooking(mockBooking);

            expect(bookingStore.currentBooking).not.toBeNull();

            bookingActions.clearBooking();

            expect(bookingStore.currentBooking).toBeNull();
            expect(bookingActions.getBooking()).toBeNull();
        });

        it('should handle clearing when no booking exists', () => {
            expect(bookingStore.currentBooking).toBeNull();

            bookingActions.clearBooking();

            expect(bookingStore.currentBooking).toBeNull();
        });
    });

    describe('getBooking', () => {
        it('should return current booking', () => {
            const mockBooking = createMockBooking();
            bookingActions.setBooking(mockBooking);

            const result = bookingActions.getBooking();

            expect(result).toEqual(mockBooking);
        });

        it('should return null when no booking exists', () => {
            const result = bookingActions.getBooking();

            expect(result).toBeNull();
        });
    });
});
