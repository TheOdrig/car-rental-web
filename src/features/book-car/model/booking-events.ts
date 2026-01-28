import { eventBus, AUTH_EVENTS, BOOKING_EVENTS } from '@/shared/events';
import { bookingActions } from './booking-store';
import type { Booking } from './types';

export { BOOKING_EVENTS } from '@/shared/events';
export type { BookingEventType } from '@/shared/events';

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
