'use client';

import { Badge } from '@/shared/ui/badge';
import { PAYMENT_STATUS_LABELS, type RentalPaymentStatus } from '../model/rental-payment';

interface PaymentStatusBadgeProps {
    status: RentalPaymentStatus;
}

function variantFor(status: RentalPaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'CAPTURED':
        case 'AUTHORIZED':
            return 'default';
        case 'FAILED':
            return 'destructive';
        case 'REFUNDED':
        case 'CANCELLED':
            return 'outline';
        default:
            return 'secondary';
    }
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    return <Badge variant={variantFor(status)}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
