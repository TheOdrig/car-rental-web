import { ownValue } from '@/shared/lib/utils';
import type { StatusPresentation } from '@/shared/types';
import {
    ADMIN_RENTAL_STATUS_LABELS,
    LATE_RETURN_STATUS_LABELS,
    RENTAL_STATUS_LABELS,
    RentalStatus,
    type AdminRentalStatus,
    type LateReturnStatus,
} from './types';

const RENTAL_TONES: Record<RentalStatus, StatusPresentation['tone']> = {
    [RentalStatus.REQUESTED]: 'warning',
    [RentalStatus.CONFIRMED]: 'info',
    [RentalStatus.IN_USE]: 'success',
    [RentalStatus.RETURNED]: 'neutral',
    [RentalStatus.CANCELLED]: 'danger',
};

const ADMIN_RENTAL_TONES: Record<AdminRentalStatus, StatusPresentation['tone']> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    ACTIVE: 'success',
    COMPLETED: 'neutral',
    CANCELLED: 'danger',
    UNKNOWN: 'neutral',
};

const LATE_RETURN_TONES: Record<LateReturnStatus, StatusPresentation['tone']> = {
    ON_TIME: 'success',
    GRACE_PERIOD: 'warning',
    LATE: 'danger',
    SEVERELY_LATE: 'danger',
};

export function rentalStatusPresentation(status: string | null | undefined): StatusPresentation {
    const label = ownValue(RENTAL_STATUS_LABELS, status);
    const tone = ownValue(RENTAL_TONES, status);
    if (label === undefined || tone === undefined) return { label: status || 'Unknown', tone: 'neutral' };
    return { label, tone };
}

export function adminRentalStatusPresentation(status: AdminRentalStatus | string | null | undefined): StatusPresentation {
    const label = ownValue(ADMIN_RENTAL_STATUS_LABELS, status);
    const tone = ownValue(ADMIN_RENTAL_TONES, status);
    if (label === undefined || tone === undefined) return { label: status || 'Unknown', tone: 'neutral' };
    return { label, tone };
}

export function lateReturnStatusPresentation(status: LateReturnStatus | string | null | undefined): StatusPresentation {
    const label = ownValue(LATE_RETURN_STATUS_LABELS, status);
    const tone = ownValue(LATE_RETURN_TONES, status);
    if (label === undefined || tone === undefined) return { label: status || 'Unknown', tone: 'neutral' };
    return { label, tone };
}
