import type { StatusPresentation } from '@/shared/types';
import { ownValue } from '@/shared/lib/utils';
import { PAYMENT_STATUS_LABELS, type RentalPaymentStatus } from './rental-payment';

const PAYMENT_TONES: Readonly<Record<RentalPaymentStatus, StatusPresentation['tone']>> = {
    PENDING: 'warning',
    AUTHORIZED: 'info',
    CAPTURED: 'success',
    FAILED: 'danger',
    REFUNDED: 'neutral',
    CANCELLED: 'neutral',
};

export function paymentStatusPresentation(status: RentalPaymentStatus | string | null | undefined): StatusPresentation {
    const label = ownValue(PAYMENT_STATUS_LABELS, status);
    const tone = ownValue(PAYMENT_TONES, status);
    if (label === undefined || tone === undefined) return { label: status || 'Unknown', tone: 'neutral' };
    return { label, tone };
}
