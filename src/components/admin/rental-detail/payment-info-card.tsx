'use client';

import { DollarSign, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import type { RentalPaymentInfo, RentalPricing, LateReturnStatus } from '@/types';
import { LateReturnStatusBadge, CopyButton } from '@/components/admin';

interface PaymentInfoCardProps {
    pricing: RentalPricing;
    payment: RentalPaymentInfo;
    penaltyAmount?: number;
    lateReturnStatus?: LateReturnStatus;
}

export function PaymentInfoCard({ pricing, payment, penaltyAmount, lateReturnStatus }: PaymentInfoCardProps) {
    const hasPenalty = (penaltyAmount ?? 0) > 0;
    const grandTotal = pricing.finalTotal + (penaltyAmount ?? 0);

    return (
        <Card className="border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                    Payment Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Daily Rate</span>
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

                    {pricing.discounts > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">Discount</span>
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">
                                -{formatCurrency(pricing.discounts, pricing.currency)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Base Total</span>
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

                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CreditCard className="h-4 w-4" />
                        <span>
                            Payment via {payment.method}
                            {payment.last4 && <span className="font-mono ml-1">•••• {payment.last4}</span>}
                        </span>
                    </div>
                    <Badge variant={payment.status === 'CAPTURED' ? 'default' : 'secondary'}>
                        {payment.status}
                    </Badge>
                </div>

                {payment.paymentIntentId && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400">Payment ID</span>
                        <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                                {payment.paymentIntentId}
                            </span>
                            <CopyButton value={payment.paymentIntentId} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

