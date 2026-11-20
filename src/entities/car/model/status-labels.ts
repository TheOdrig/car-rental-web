import { ownValue } from '@/shared/lib/utils';
import type { CarOccupancy, CarStatus, DayAvailabilityStatus } from './types';

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
    AVAILABLE: 'Available',
    MAINTENANCE: 'Maintenance',
    DAMAGED: 'Damaged',
    INSPECTION: 'Inspection',
};

export const CAR_STATUSES = Object.keys(CAR_STATUS_LABELS) as CarStatus[];

export const CAR_OCCUPANCY_LABELS: Record<CarOccupancy, string> = {
    FREE: 'Free',
    RESERVED: 'Reserved today',
    IN_USE: 'In use',
};

export const CAR_OCCUPANCIES = Object.keys(CAR_OCCUPANCY_LABELS) as CarOccupancy[];

export function carOccupancyLabel(occupancy: string | null | undefined): string {
    return ownValue(CAR_OCCUPANCY_LABELS, occupancy) ?? CAR_OCCUPANCY_LABELS.FREE;
}

export const AVAILABILITY_STATUS_LABELS: Record<DayAvailabilityStatus, string> = {
    AVAILABLE: 'Available',
    UNAVAILABLE: 'Booked',
};

export function carStatusLabel(status: string | null | undefined): string {
    return ownValue(CAR_STATUS_LABELS, status) ?? status ?? '';
}

export const CAR_STATUS = {
    AVAILABLE: 'AVAILABLE',
    MAINTENANCE: 'MAINTENANCE',
    DAMAGED: 'DAMAGED',
    INSPECTION: 'INSPECTION',
} as const satisfies Record<CarStatus, CarStatus>;

export const DAY_AVAILABILITY = {
    AVAILABLE: 'AVAILABLE',
    UNAVAILABLE: 'UNAVAILABLE',
} as const satisfies Record<DayAvailabilityStatus, DayAvailabilityStatus>;
