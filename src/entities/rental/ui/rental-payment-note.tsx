import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib';
import { getPayByLabel, getRentalPaymentStateLabel, isRentalPaymentSecured } from '../lib/rental-payment-state';
import { RentalStatus } from '../model/types';

interface RentalPaymentNoteProps {
    status: RentalStatus;
    paymentStatus?: string | null;
    paymentDueBy?: string | null;
    className?: string;
}

export function RentalPaymentNote({ status, paymentStatus, paymentDueBy, className }: RentalPaymentNoteProps) {
    if (status === RentalStatus.CANCELLED || status === RentalStatus.REQUESTED) return null;

    const stateLabel = getRentalPaymentStateLabel(paymentStatus);
    if (stateLabel) {
        return (
            <p
                className={cn('flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400', className)}
                data-testid="rental-payment-state"
            >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                {stateLabel}
            </p>
        );
    }

    const payBy = status === RentalStatus.CONFIRMED && !isRentalPaymentSecured(paymentStatus) ? getPayByLabel(paymentDueBy) : undefined;
    if (!payBy) return null;

    return (
        <p className={cn('text-sm text-muted-foreground', className)} data-testid="rental-pay-by">
            {payBy}
        </p>
    );
}
