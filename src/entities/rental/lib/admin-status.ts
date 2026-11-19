import { ownValue } from '@/shared/lib/utils';
import { RentalStatus, type AdminRentalStatus } from '../model/types';

const API_TO_ADMIN: Record<RentalStatus, AdminRentalStatus> = {
    [RentalStatus.REQUESTED]: 'PENDING',
    [RentalStatus.CONFIRMED]: 'CONFIRMED',
    [RentalStatus.IN_USE]: 'ACTIVE',
    [RentalStatus.RETURNED]: 'COMPLETED',
    [RentalStatus.CANCELLED]: 'CANCELLED',
};

const ADMIN_TO_API: Record<AdminRentalStatus, RentalStatus> = {
    PENDING: RentalStatus.REQUESTED,
    CONFIRMED: RentalStatus.CONFIRMED,
    ACTIVE: RentalStatus.IN_USE,
    OVERDUE: RentalStatus.IN_USE,
    COMPLETED: RentalStatus.RETURNED,
    CANCELLED: RentalStatus.CANCELLED,
    REJECTED: RentalStatus.CANCELLED,
};

export function toAdminRentalStatus(status: string | undefined): AdminRentalStatus {
    return ownValue(API_TO_ADMIN, status) ?? 'PENDING';
}

export function toApiRentalStatus(status: string): string {
    return ownValue(ADMIN_TO_API, status) ?? status;
}
