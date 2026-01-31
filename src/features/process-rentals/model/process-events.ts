import { eventBus } from '@/shared/events';





export const PROCESS_EVENTS = {
    RENTAL_APPROVED: 'process:rental:approved',
    RENTAL_REJECTED: 'process:rental:rejected',
    PICKUP_PROCESSED: 'process:pickup:processed',
    RETURN_PROCESSED: 'process:return:processed',
} as const;

export type ProcessEventType = typeof PROCESS_EVENTS[keyof typeof PROCESS_EVENTS];





export interface RentalApprovedPayload {
    rentalId: number;
    notes?: string;
    approvedBy?: string;
}

export interface RentalRejectedPayload {
    rentalId: number;
    reason: string;
    rejectedBy?: string;
}

export interface PickupProcessedPayload {
    rentalId: number;
    notes?: string;
    processedBy?: string;
}

export interface ReturnProcessedPayload {
    rentalId: number;
    hasDamage?: boolean;
    notes?: string;
    processedBy?: string;
}





export function publishRentalApproved(payload: RentalApprovedPayload): void {
    eventBus.publish(PROCESS_EVENTS.RENTAL_APPROVED, payload);
}

export function publishRentalRejected(payload: RentalRejectedPayload): void {
    eventBus.publish(PROCESS_EVENTS.RENTAL_REJECTED, payload);
}

export function publishPickupProcessed(payload: PickupProcessedPayload): void {
    eventBus.publish(PROCESS_EVENTS.PICKUP_PROCESSED, payload);
}

export function publishReturnProcessed(payload: ReturnProcessedPayload): void {
    eventBus.publish(PROCESS_EVENTS.RETURN_PROCESSED, payload);
}





export function subscribeToRentalApproved(handler: (payload: RentalApprovedPayload) => void): () => void {
    return eventBus.subscribe(PROCESS_EVENTS.RENTAL_APPROVED, handler);
}

export function subscribeToRentalRejected(handler: (payload: RentalRejectedPayload) => void): () => void {
    return eventBus.subscribe(PROCESS_EVENTS.RENTAL_REJECTED, handler);
}

export function subscribeToPickupProcessed(handler: (payload: PickupProcessedPayload) => void): () => void {
    return eventBus.subscribe(PROCESS_EVENTS.PICKUP_PROCESSED, handler);
}

export function subscribeToReturnProcessed(handler: (payload: ReturnProcessedPayload) => void): () => void {
    return eventBus.subscribe(PROCESS_EVENTS.RETURN_PROCESSED, handler);
}