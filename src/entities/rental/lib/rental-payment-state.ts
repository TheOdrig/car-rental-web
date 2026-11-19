import { formatDateTime, parseApiDate } from '@/shared/lib';

export type RentalPaymentSignal = string | undefined | null;

const SECURED = new Set(['AUTHORIZED', 'CAPTURED']);

export function isRentalPaymentSecured(paymentStatus: RentalPaymentSignal): boolean {
    return !!paymentStatus && SECURED.has(paymentStatus);
}

export function getRentalPaymentStateLabel(paymentStatus: RentalPaymentSignal): string | undefined {
    if (paymentStatus === 'CAPTURED') return 'Paid';
    if (paymentStatus === 'AUTHORIZED') return 'Payment authorized';
    return undefined;
}

export function getPayByLabel(paymentDueBy: string | undefined | null): string | undefined {
    if (!parseApiDate(paymentDueBy)) return undefined;
    return `Pay by ${formatDateTime(paymentDueBy!)}`;
}
