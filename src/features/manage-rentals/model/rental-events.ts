import { eventBus, AUTH_EVENTS, RENTAL_EVENTS } from '@/shared/events';
import { rentalActions } from './rental-store';
import type { Rental } from '@/types/rental';

export { RENTAL_EVENTS } from '@/shared/events';
export type { RentalEventType } from '@/shared/events';

export function publishRentalApproved(rental: Rental): void {
    eventBus.publish(RENTAL_EVENTS.APPROVED, rental);
}

export function publishRentalRejected(rental: Rental): void {
    eventBus.publish(RENTAL_EVENTS.REJECTED, rental);
}

export function publishRentalPickedUp(rental: Rental): void {
    eventBus.publish(RENTAL_EVENTS.PICKED_UP, rental);
}

export function publishRentalReturned(rental: Rental): void {
    eventBus.publish(RENTAL_EVENTS.RETURNED, rental);
}

export function publishRentalCancelled(rentalId: number): void {
    eventBus.publish(RENTAL_EVENTS.CANCELLED, { rentalId });
}

export function publishRentalUpdated(rental: Rental): void {
    eventBus.publish(RENTAL_EVENTS.UPDATED, rental);
}

eventBus.subscribe(AUTH_EVENTS.LOGOUT, () => {
    rentalActions.clearRentals();
});
