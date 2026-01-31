import { eventBus } from '@/shared/events';
import { RENTAL_EVENTS } from '@/entities/rental';
import { rentalActions } from './rental-store';
import type { Rental } from '@/entities/rental';

export type { RentalEventType } from '@/entities/rental';

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

eventBus.subscribe('auth:logout', () => {
    rentalActions.clearRentals();
});
