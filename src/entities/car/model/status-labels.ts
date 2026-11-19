import { ownValue } from '@/shared/lib/utils';
import type { CarStatus, DayAvailabilityStatus } from './types';

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
    AVAILABLE: 'Available',
    MAINTENANCE: 'Maintenance',
    DAMAGED: 'Damaged',
    INSPECTION: 'Inspection',
};

export const CAR_STATUSES = Object.keys(CAR_STATUS_LABELS) as CarStatus[];

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
