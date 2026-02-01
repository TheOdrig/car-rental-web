import { eventBus } from '@/shared/events';
import { bookingActions } from './booking-store';
import type { BookingConfirmation } from './types';

export const BOOKING_EVENTS = {
    CREATED: 'booking:created',
    UPDATED: 'booking:updated',
    CANCELLED: 'booking:cancelled',
} as const;

export type BookingEventType = typeof BOOKING_EVENTS[keyof typeof BOOKING_EVENTS];

export function publishBookingCreated(booking: BookingConfirmation): void {
    eventBus.publish(BOOKING_EVENTS.CREATED, booking);
}

export function publishBookingUpdated(booking: BookingConfirmation): void {
    eventBus.publish(BOOKING_EVENTS.UPDATED, booking);
}

export function publishBookingCancelled(bookingId: number): void {
    eventBus.publish(BOOKING_EVENTS.CANCELLED, { bookingId });
}

eventBus.subscribe('auth:logout', () => {
    bookingActions.clearBooking();
});