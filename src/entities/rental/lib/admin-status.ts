import { RentalStatus, type AdminRentalStatus } from '../model/types';

export function toAdminRentalStatus(status: string | undefined): AdminRentalStatus {
    switch (status) {
        case RentalStatus.REQUESTED:
            return 'PENDING';
        case RentalStatus.CONFIRMED:
            return 'CONFIRMED';
        case RentalStatus.IN_USE:
            return 'ACTIVE';
        case RentalStatus.RETURNED:
            return 'COMPLETED';
        case RentalStatus.CANCELLED:
            return 'CANCELLED';
        default:
            return 'UNKNOWN';
    }
}

export function toApiRentalStatus(status: string): string {
    switch (status) {
        case 'PENDING':
            return RentalStatus.REQUESTED;
        case 'CONFIRMED':
            return RentalStatus.CONFIRMED;
        case 'ACTIVE':
            return RentalStatus.IN_USE;
        case 'COMPLETED':
            return RentalStatus.RETURNED;
        case 'CANCELLED':
            return RentalStatus.CANCELLED;
        default:
            return status;
    }
}

export const ADMIN_RENTAL_FILTER_STATUSES: AdminRentalStatus[] = ['COMPLETED', 'ACTIVE', 'CANCELLED', 'PENDING'];

const PAYMENT_NOT_EXPECTED: AdminRentalStatus[] = ['PENDING', 'CANCELLED', 'UNKNOWN'];

export function isAdminPaymentExpected(status: AdminRentalStatus | undefined): boolean {
    return !!status && !PAYMENT_NOT_EXPECTED.includes(status);
}

export function isPenaltyHistoryStatus(status: AdminRentalStatus): boolean {
    const withHistory: AdminRentalStatus[] = ['COMPLETED', 'ACTIVE'];
    return withHistory.includes(status);
}

export function isAwaitingPickup(status: AdminRentalStatus): boolean {
    return status === 'CONFIRMED';
}
