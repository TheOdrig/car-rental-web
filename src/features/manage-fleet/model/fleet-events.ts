import { eventBus } from '@/shared/events';
import type { Car } from '@/entities/car';





export const FLEET_EVENTS = {
    CAR_ADDED: 'fleet:car:added',
    CAR_UPDATED: 'fleet:car:updated',
    CAR_DELETED: 'fleet:car:deleted',
    CAR_STATUS_CHANGED: 'fleet:car:status-changed',
} as const;

export type FleetEventType = typeof FLEET_EVENTS[keyof typeof FLEET_EVENTS];





export interface FleetCarSnapshot {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
}

export interface CarAddedPayload {
    car: FleetCarSnapshot;
    addedBy?: string;
}

export interface CarUpdatedPayload {
    carId: number;
    car: FleetCarSnapshot;
    updatedBy?: string;
    changes?: Partial<Car>;
}

export interface CarDeletedPayload {
    carId: number;
    deletedBy?: string;
}

export interface CarStatusChangedPayload {
    carId: number;
    oldStatus: string;
    newStatus: string;
    reason?: string;
    changedBy?: string;
}





export function publishCarAdded(payload: CarAddedPayload): void {
    eventBus.publish(FLEET_EVENTS.CAR_ADDED, payload);
}

export function publishCarUpdated(payload: CarUpdatedPayload): void {
    eventBus.publish(FLEET_EVENTS.CAR_UPDATED, payload);
}

export function publishCarDeleted(payload: CarDeletedPayload): void {
    eventBus.publish(FLEET_EVENTS.CAR_DELETED, payload);
}

export function publishCarStatusChanged(payload: CarStatusChangedPayload): void {
    eventBus.publish(FLEET_EVENTS.CAR_STATUS_CHANGED, payload);
}





export function subscribeToCarAdded(handler: (payload: CarAddedPayload) => void): () => void {
    return eventBus.subscribe(FLEET_EVENTS.CAR_ADDED, handler);
}

export function subscribeToCarUpdated(handler: (payload: CarUpdatedPayload) => void): () => void {
    return eventBus.subscribe(FLEET_EVENTS.CAR_UPDATED, handler);
}

export function subscribeToCarDeleted(handler: (payload: CarDeletedPayload) => void): () => void {
    return eventBus.subscribe(FLEET_EVENTS.CAR_DELETED, handler);
}

export function subscribeToCarStatusChanged(handler: (payload: CarStatusChangedPayload) => void): () => void {
    return eventBus.subscribe(FLEET_EVENTS.CAR_STATUS_CHANGED, handler);
}