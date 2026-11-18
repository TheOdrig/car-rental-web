import { ownValue } from '@/shared/lib/utils';
import type { AdminRentalStatus } from '../model/types';

const API_TO_ADMIN: Record<string, AdminRentalStatus> = {
    Requested: 'PENDING',
    Confirmed: 'CONFIRMED',
    'In Use': 'ACTIVE',
    Returned: 'COMPLETED',
    Cancelled: 'CANCELLED',
};

const ADMIN_TO_API: Record<AdminRentalStatus, string> = {
    PENDING: 'Requested',
    CONFIRMED: 'Confirmed',
    ACTIVE: 'In Use',
    OVERDUE: 'In Use',
    COMPLETED: 'Returned',
    CANCELLED: 'Cancelled',
    REJECTED: 'Cancelled',
};

export function toAdminRentalStatus(status: string | undefined): AdminRentalStatus {
    return ownValue(API_TO_ADMIN, status) ?? 'PENDING';
}

export function toApiRentalStatus(status: string): string {
    return ownValue(ADMIN_TO_API, status) ?? status;
}
