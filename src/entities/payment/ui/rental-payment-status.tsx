'use client';

import type { ReactNode } from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCurrencyWithDecimals } from '@/shared/lib';
import { isApiError } from '@/shared/api';
import { useRentalPayment } from '../lib/use-rental-payment';
import type { RentalPaymentStatus as PaymentStatusValue } from '../model/rental-payment';
import { PaymentStatusBadge } from './payment-status-badge';

interface RentalPaymentStatusProps {
    rentalId: number;
    action?: (status: PaymentStatusValue | undefined) => ReactNode;
    note?: ReactNode;
    emptyMessage?: string;
    className?: string;
    enabled?: boolean;
}

export function RentalPaymentStatus({
    rentalId,
    action,
    note,
    emptyMessage = 'No payment has been started for this rental yet.',
    className,
    enabled = true,
}: RentalPaymentStatusProps) {
    const { data, isLoading, error } = useRentalPayment(rentalId, { enabled });
    const missing = !enabled || (isApiError(error) && error.status === 404);
    const refunded = data?.refundedAmount ?? 0;
    const loadFailed = !isLoading && !!error && !missing;
    const neverCharged = data?.status === 'CANCELLED' && refunded === 0;

    return (
        <Card className={className} data-testid="rental-payment-status">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                    Payment
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {enabled && isLoading && <Skeleton className="h-10 w-full" />}

                {loadFailed && (
                    <p className="text-sm text-destructive" role="alert">
                        Payment status could not be loaded.
                    </p>
                )}

                {(!enabled || !isLoading) && missing && !data && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}

                {data && (
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <PaymentStatusBadge status={data.status} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{neverCharged ? 'Amount (not charged)' : 'Amount'}</span>
                            <span className="font-medium">{formatCurrencyWithDecimals(data.amount, data.currency)}</span>
                        </div>
                        {refunded > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Refunded</span>
                                <span className="font-medium">{formatCurrencyWithDecimals(refunded, data.currency)}</span>
                            </div>
                        )}
                        {neverCharged && (
                            <p className="text-muted-foreground" data-testid="payment-not-charged">
                                This payment was cancelled and no money was taken.
                            </p>
                        )}
                        {data.status === 'FAILED' && data.failureReason && (
                            <p className="text-destructive">{data.failureReason}</p>
                        )}
                    </div>
                )}

                {note}

                {!isLoading && !loadFailed && action?.(data?.status)}
            </CardContent>
        </Card>
    );
}
