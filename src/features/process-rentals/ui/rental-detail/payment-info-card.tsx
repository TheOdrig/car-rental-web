'use client';

import { DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { formatCurrency, formatDateTime, parseApiDate } from '@/shared/lib';
import type { RentalPricing } from '@/entities/rental';
import { RentalPaymentStatus } from '@/entities/payment';
import type { LateReturnStatus } from '@/entities/rental';
import { LateReturnStatusBadge } from '@/entities/rental';

interface PaymentInfoCardProps {
    rentalId: number;
    pricing: RentalPricing;
    penaltyAmount?: number;
    lateReturnStatus?: LateReturnStatus;
    paymentEnabled?: boolean;
    paymentDueBy?: string;
}

export function PaymentInfoCard({ rentalId, pricing, penaltyAmount, lateReturnStatus, paymentEnabled = true, paymentDueBy }: PaymentInfoCardProps) {
    const hasPenalty = (penaltyAmount ?? 0) > 0;
    const grandTotal = pricing.finalTotal + (penaltyAmount ?? 0);

    return (
        <div className="space-y-6">
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    Payment Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Avg. Daily Rate</span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(pricing.dailyRate, pricing.currency)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Duration</span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {pricing.totalDays} days
                        </span>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Subtotal</span>
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                            {formatCurrency(pricing.subtotal, pricing.currency)}
                        </span>
                    </div>

                    {(pricing.appliedAdjustments?.length ?? 0) > 0 && (
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400" data-testid="applied-adjustments">
                            {pricing.appliedAdjustments?.map((entry) => (
                                <li key={entry}>{entry}</li>
                            ))}
                        </ul>
                    )}

                    {pricing.discounts > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">Discount</span>
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">
                                -{formatCurrency(pricing.discounts, pricing.currency)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rental Total</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(pricing.finalTotal, pricing.currency)}
                        </span>
                    </div>
                </div>

                {hasPenalty && (
                    <div className="border-t border-red-200 dark:border-red-900/50 pt-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600 dark:text-red-400">Late Return Penalty</span>
                                {lateReturnStatus && <LateReturnStatusBadge status={lateReturnStatus} />}
                            </div>
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                +{formatCurrency(penaltyAmount ?? 0, pricing.currency)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Grand Total</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(grandTotal, pricing.currency)}
                            </span>
                        </div>
                    </div>
                )}

                {!hasPenalty && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Total Amount</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(pricing.finalTotal, pricing.currency)}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
        <RentalPaymentStatus
            rentalId={rentalId}
            enabled={paymentEnabled}
            className="border-border bg-card"
            note={
                parseApiDate(paymentDueBy) ? (
                    <p className="text-sm text-muted-foreground" data-testid="payment-due-by">
                        Pay by {formatDateTime(paymentDueBy)}
                    </p>
                ) : undefined
            }
        />
        </div>
    );
}