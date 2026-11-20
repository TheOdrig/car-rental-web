import type { StatusPresentation } from '@/shared/types';
import { PAYMENT_STATUS_LABELS, type RentalPaymentStatus } from './rental-payment';

const PAYMENT_TONES: Record<RentalPaymentStatus, StatusPresentation['tone']> = {
    PENDING: 'warning',
    AUTHORIZED: 'info',
    CAPTURED: 'success',
    FAILED: 'danger',
    REFUNDED: 'neutral',
    CANCELLED: 'neutral',
};

export function paymentStatusPresentation(status: RentalPaymentStatus): StatusPresentation {
    return { label: PAYMENT_STATUS_LABELS[status], tone: PAYMENT_TONES[status] };
}
