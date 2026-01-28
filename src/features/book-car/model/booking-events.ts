import { eventBus } from '@/shared/events/event-bus';
import { AUTH_EVENTS } from '@/features/auth/model/auth-events';
import { bookingActions } from './booking-store';
import type { Booking } from './types';

export const BOOKING_EVENTS = {
    CREATED: 'booking:created',
    UPDATED: 'booking:updated',
    CANCELLED: 'booking:cancelled',
} as const;

export type BookingEventType = typeof BOOKING_EVENTS[keyof typeof BOOKING_EVENTS];

export function publishBookingCreated(booking: Booking): void {
    eventBus.publish(BOOKING_EVENTS.CREATED, booking);
}

export function publishBookingUpdated(booking: Booking): void {
    eventBus.publish(BOOKING_EVENTS.UPDATED, booking);
}

export function publishBookingCancelled(bookingId: number): void {
    eventBus.publish(BOOKING_EVENTS.CANCELLED, { bookingId });
}

eventBus.subscribe(AUTH_EVENTS.LOGOUT, () => {
    bookingActions.clearBooking();
});
