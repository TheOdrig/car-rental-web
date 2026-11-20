'use client';

import { StatusBadge } from '@/shared/ui/status-badge';
import { paymentStatusPresentation } from '../model/status-presentation';
import type { RentalPaymentStatus } from '../model/rental-payment';

interface PaymentStatusBadgeProps {
    status?: RentalPaymentStatus | string | null;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const { label, tone } = paymentStatusPresentation(status);
    return <StatusBadge tone={tone}>{label}</StatusBadge>;
}
